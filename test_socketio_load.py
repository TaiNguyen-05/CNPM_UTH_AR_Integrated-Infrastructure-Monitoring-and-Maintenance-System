"""
AR-IMMS Socket.IO Load & Fault-Tolerance Test Suite
=====================================================
Kiểm thử tải (load test) cho Real-Time Telemetry Gateway (Flask-SocketIO):

  1. Mô phỏng N client Dashboard kết nối đồng thời tới WebSocket Gateway,
     tất cả cùng join room "dashboard".
  2. Một "publisher" liên tục POST telemetry (giống Collector Agent thật)
     lên endpoint /api/telemetry/ingest với chu kỳ cấu hình được.
  3. Mỗi gói telemetry được gắn kèm 1 marker (seq + sent_at) trong trường
     "containers" -> marker này được server pass-through nguyên vẹn và
     broadcast lại qua sự kiện "telemetry_stream", nên ta đo được CHÍNH XÁC
     độ trễ end-to-end (ingest -> broadcast -> client nhận) cho từng client,
     từng gói tin, kể cả khi có mất gói / thứ tự bị đảo.
  4. (Tuỳ chọn --fault-test) Giữa bài test, chủ động ngắt kết nối một tỷ lệ
     client (giả lập rớt mạng / thiết bị AR mất sóng Wi-Fi trong Mini Data
     Center) rồi đo thời gian & tỷ lệ tự động reconnect thành công của
     socket.io-client (reconnection tự động, giống cấu hình thực tế ở
     frontend/src/services/socketService.ts).

Kết quả: bảng thống kê latency (p50/p90/p95/p99/max), tỷ lệ gói nhận được
(delivery rate), thống kê reconnect, và file JSON/CSV chi tiết để đưa vào
báo cáo Luận văn / Đồ án (phần Kiểm thử Toàn diện - KAN-20).

Cách chạy:
    # Cài dependency (một lần):
    pip install "python-socketio[asyncio_client]" aiohttp requests --break-system-packages

    # 1) Test tải cơ bản: 50 client, 60 giây, gửi telemetry mỗi 1s
    python test_socketio_load.py --server http://localhost:9999 --clients 50 --duration 60

    # 2) Test tải cao + chịu lỗi: 200 client, ngắt 30% client giữa chừng
    python test_socketio_load.py --clients 200 --duration 90 --fault-test --disconnect-ratio 0.3

    # 3) Test tải cao tần suất publish nhanh (giống nhiều node cùng gửi 5s/lần dồn dập)
    python test_socketio_load.py --clients 100 --duration 60 --publish-interval 0.2
"""

import argparse
import asyncio
import csv
import json
import os
import random
import statistics
import time
from datetime import datetime

import requests
import socketio


# --------------------------------------------------------------------------
# Cấu trúc lưu kết quả
# --------------------------------------------------------------------------

class ClientStats:
    """Thống kê của một client Socket.IO mô phỏng."""

    __slots__ = (
        "client_id", "connected", "connect_time_ms", "connect_error",
        "latencies_ms", "received_seqs", "disconnected_at", "reconnected_at",
        "reconnect_time_ms", "was_disconnected", "reconnect_success",
        "selected_for_fault",
    )

    def __init__(self, client_id: int):
        self.client_id = client_id
        self.connected = False
        self.connect_time_ms = None
        self.connect_error = None
        self.latencies_ms = []          # độ trễ (ms) từng gói telemetry nhận được
        self.received_seqs = set()      # các seq đã nhận (để tính delivery rate)
        self.disconnected_at = None
        self.reconnected_at = None
        self.reconnect_time_ms = None
        self.was_disconnected = False
        self.reconnect_success = False
        self.selected_for_fault = False  # client này có nằm trong nhóm bị ngắt cưỡng bức không


# --------------------------------------------------------------------------
# Client Socket.IO mô phỏng 1 phiên Dashboard / AR App xem realtime
# --------------------------------------------------------------------------

async def run_dashboard_client(client_id, server_url, room, stats: ClientStats,
                                stop_event: asyncio.Event, force_disconnect_event: asyncio.Event):
    sio = socketio.AsyncClient(
        reconnection=True,
        reconnection_attempts=10,
        reconnection_delay=1,
        reconnection_delay_max=5,
        logger=False,
        engineio_logger=False,
    )

    @sio.event
    async def connect():
        if stats.was_disconnected and stats.disconnected_at is not None and stats.reconnected_at is None:
            stats.reconnected_at = time.time()
            stats.reconnect_time_ms = (stats.reconnected_at - stats.disconnected_at) * 1000
            stats.reconnect_success = True
        await sio.emit("join_room", {"room": room})

    @sio.event
    async def disconnect():
        # Chỉ tính là "sự cố rớt mạng" nếu xảy ra TRƯỚC khi bài test kết thúc
        # (bỏ qua lần disconnect cleanup bình thường ở cuối bài test).
        if stats.connected and not stop_event.is_set():
            stats.was_disconnected = True
            stats.disconnected_at = time.time()

    @sio.on("telemetry_stream")
    async def on_telemetry(data):
        marker = None
        for c in (data.get("containers") or []):
            if isinstance(c, dict) and c.get("name") == "__LOADTEST_MARKER__":
                marker = c
                break
        if not marker:
            return  # gói không phải của load test (bỏ qua)
        seq = marker.get("seq")
        sent_at = marker.get("sent_at")
        if seq is None or sent_at is None or seq in stats.received_seqs:
            return
        stats.received_seqs.add(seq)
        latency_ms = (time.time() - float(sent_at)) * 1000
        if latency_ms >= 0:
            stats.latencies_ms.append(latency_ms)

    t0 = time.time()
    try:
        await sio.connect(server_url, transports=["websocket", "polling"], wait_timeout=10)
        stats.connected = True
        stats.connect_time_ms = (time.time() - t0) * 1000
    except Exception as e:
        stats.connect_error = str(e)
        return

    try:
        while not stop_event.is_set():
            if force_disconnect_event.is_set() and stats.selected_for_fault and not stats.was_disconnected:
                try:
                    await sio.disconnect()
                except Exception:
                    pass
                # Chờ một nhịp ngắn rồi tự thử reconnect (giả lập thiết bị bắt lại sóng)
                await asyncio.sleep(random.uniform(0.5, 2.0))
                try:
                    await sio.connect(server_url, transports=["websocket", "polling"], wait_timeout=10)
                except Exception:
                    pass
            await asyncio.sleep(0.2)
    finally:
        try:
            if sio.connected:
                await sio.disconnect()
        except Exception:
            pass


# --------------------------------------------------------------------------
# Publisher: giả lập Collector Agent liên tục gửi telemetry (giống thật)
# --------------------------------------------------------------------------

def publish_loop(server_url, node_id, interval, stop_flag, seq_counter, results_log):
    endpoint = f"{server_url.rstrip('/')}/api/telemetry/ingest"
    seq = 0
    while not stop_flag["stop"]:
        seq += 1
        sent_at = time.time()
        payload = {
            "node_id": node_id,
            "cpu": round(random.uniform(30.0, 60.0), 1),   # giữ trong ngưỡng an toàn, tránh spam alert
            "ram": round(random.uniform(40.0, 70.0), 1),
            "disk": round(random.uniform(35.0, 55.0), 1),
            "temp": round(random.uniform(38.0, 55.0), 1),
            "network_in_kbps": round(random.uniform(100, 400), 1),
            "network_out_kbps": round(random.uniform(100, 400), 1),
            "containers": [
                {"name": "__LOADTEST_MARKER__", "seq": seq, "sent_at": sent_at,
                 "image": "loadtest:marker", "status": "RUNNING", "cpu": "0%", "ram": "0MB"}
            ],
        }
        try:
            resp = requests.post(endpoint, json=payload, timeout=4)
            results_log.append({
                "seq": seq, "sent_at": sent_at, "http_status": resp.status_code,
                "http_latency_ms": (time.time() - sent_at) * 1000,
            })
        except Exception as e:
            results_log.append({"seq": seq, "sent_at": sent_at, "http_status": "ERROR", "error": str(e)})
        seq_counter["total_sent"] = seq
        time.sleep(interval)


# --------------------------------------------------------------------------
# Orchestration
# --------------------------------------------------------------------------

async def main_async(args):
    server_url = args.server.rstrip("/")
    print("=" * 78)
    print("🧪 AR-IMMS SOCKET.IO LOAD & FAULT-TOLERANCE TEST")
    print("=" * 78)
    print(f"🎯 Server:            {server_url}")
    print(f"👥 Số client giả lập: {args.clients}")
    print(f"⏱️ Thời lượng test:   {args.duration}s")
    print(f"📡 Chu kỳ publish:    {args.publish_interval}s (node: {args.node_id})")
    if args.fault_test:
        print(f"💥 Fault test:        BẬT (ngắt {int(args.disconnect_ratio * 100)}% client ở giây thứ {args.disconnect_at})")
    print("=" * 78)

    # Kiểm tra server sống trước khi test
    try:
        health = requests.get(f"{server_url}/api/health", timeout=5)
        print(f"✅ Health check: {health.json()}")
    except Exception as e:
        print(f"❌ Không kết nối được server tại {server_url}: {e}")
        return

    stop_event = asyncio.Event()
    force_disconnect_event = asyncio.Event()
    all_stats = [ClientStats(i) for i in range(args.clients)]

    # --- Khởi động publisher (chạy ở thread riêng vì dùng requests đồng bộ) ---
    stop_flag = {"stop": False}
    seq_counter = {"total_sent": 0}
    publish_log = []
    import threading
    publisher_thread = threading.Thread(
        target=publish_loop,
        args=(server_url, args.node_id, args.publish_interval, stop_flag, seq_counter, publish_log),
        daemon=True,
    )
    publisher_thread.start()

    # --- Khởi động N client dashboard đồng thời ---
    tasks = [
        asyncio.create_task(
            run_dashboard_client(i, server_url, "dashboard", all_stats[i], stop_event, force_disconnect_event)
        )
        for i in range(args.clients)
    ]

    start_time = time.time()

    async def scheduler():
        elapsed = 0
        fault_triggered = False
        chosen_for_disconnect = set()
        while elapsed < args.duration:
            await asyncio.sleep(1)
            elapsed = time.time() - start_time
            if args.fault_test and not fault_triggered and elapsed >= args.disconnect_at:
                fault_triggered = True
                n_disc = max(1, int(args.clients * args.disconnect_ratio))
                chosen_for_disconnect = set(random.sample(range(args.clients), n_disc))
                print(f"\n💥 [t={elapsed:.1f}s] Chủ động ngắt kết nối {n_disc}/{args.clients} client để test khả năng chịu lỗi...")
                for cid in chosen_for_disconnect:
                    all_stats[cid].selected_for_fault = True
                force_disconnect_event.set()
            progress = int((elapsed / args.duration) * 40)
            bar = "█" * progress + "░" * (40 - progress)
            print(f"\r⏳ [{bar}] {elapsed:5.1f}s / {args.duration}s | Đã gửi: {seq_counter['total_sent']} gói", end="", flush=True)
        stop_event.set()

    await scheduler()
    stop_flag["stop"] = True

    await asyncio.gather(*tasks, return_exceptions=True)
    total_duration = time.time() - start_time
    print("\n" + "=" * 78)

    return all_stats, publish_log, seq_counter, total_duration


# --------------------------------------------------------------------------
# Báo cáo kết quả
# --------------------------------------------------------------------------

def percentile(data, pct):
    if not data:
        return None
    data = sorted(data)
    k = (len(data) - 1) * (pct / 100)
    f, c = int(k), min(int(k) + 1, len(data) - 1)
    if f == c:
        return data[f]
    return data[f] + (data[c] - data[f]) * (k - f)


def build_report(all_stats, publish_log, seq_counter, total_duration, args):
    total_sent = seq_counter["total_sent"]
    connected_clients = [s for s in all_stats if s.connected]
    failed_clients = [s for s in all_stats if not s.connected]

    all_latencies = []
    per_client_delivery = []
    for s in connected_clients:
        all_latencies.extend(s.latencies_ms)
        if total_sent > 0:
            per_client_delivery.append(len(s.received_seqs) / total_sent)

    reconnected = [s for s in all_stats if s.was_disconnected]
    reconnect_success = [s for s in reconnected if s.reconnect_success]
    reconnect_times = [s.reconnect_time_ms for s in reconnect_success if s.reconnect_time_ms is not None]

    http_latencies = [r["http_latency_ms"] for r in publish_log if isinstance(r.get("http_latency_ms"), float)]
    http_errors = [r for r in publish_log if r.get("http_status") == "ERROR" or (isinstance(r.get("http_status"), int) and r["http_status"] >= 400)]

    report = {
        "test_config": {
            "server": args.server,
            "clients": args.clients,
            "duration_sec": args.duration,
            "publish_interval_sec": args.publish_interval,
            "node_id": args.node_id,
            "fault_test": args.fault_test,
            "disconnect_ratio": args.disconnect_ratio if args.fault_test else None,
            "run_at": datetime.now().isoformat() + "Z",
            "actual_duration_sec": round(total_duration, 2),
        },
        "connection": {
            "requested_clients": args.clients,
            "connected_ok": len(connected_clients),
            "connect_failed": len(failed_clients),
            "connect_success_rate_pct": round(len(connected_clients) / args.clients * 100, 2) if args.clients else 0,
            "avg_connect_time_ms": round(statistics.mean([s.connect_time_ms for s in connected_clients]), 2) if connected_clients else None,
        },
        "publish": {
            "total_telemetry_sent": total_sent,
            "http_ingest_errors": len(http_errors),
            "avg_http_ingest_latency_ms": round(statistics.mean(http_latencies), 2) if http_latencies else None,
            "p95_http_ingest_latency_ms": round(percentile(http_latencies, 95), 2) if http_latencies else None,
        },
        "realtime_delivery_latency_ms": {
            "sample_count": len(all_latencies),
            "min": round(min(all_latencies), 2) if all_latencies else None,
            "avg": round(statistics.mean(all_latencies), 2) if all_latencies else None,
            "p50": round(percentile(all_latencies, 50), 2) if all_latencies else None,
            "p90": round(percentile(all_latencies, 90), 2) if all_latencies else None,
            "p95": round(percentile(all_latencies, 95), 2) if all_latencies else None,
            "p99": round(percentile(all_latencies, 99), 2) if all_latencies else None,
            "max": round(max(all_latencies), 2) if all_latencies else None,
        },
        "delivery_rate": {
            "avg_pct_per_client": round(statistics.mean(per_client_delivery) * 100, 2) if per_client_delivery else None,
            "min_pct_per_client": round(min(per_client_delivery) * 100, 2) if per_client_delivery else None,
        },
        "fault_tolerance": {
            "clients_disconnected_during_test": len(reconnected),
            "clients_reconnected_ok": len(reconnect_success),
            "reconnect_success_rate_pct": round(len(reconnect_success) / len(reconnected) * 100, 2) if reconnected else None,
            "avg_reconnect_time_ms": round(statistics.mean(reconnect_times), 2) if reconnect_times else None,
            "max_reconnect_time_ms": round(max(reconnect_times), 2) if reconnect_times else None,
        } if args.fault_test else None,
    }
    return report


def print_report(report):
    def line(label, value, unit=""):
        v = "N/A" if value is None else f"{value}{unit}"
        print(f"  {label:<38} {v}")

    print("\n📊 KẾT QUẢ TEST")
    print("-" * 78)
    print("🔌 Kết nối:")
    c = report["connection"]
    line("Client kết nối thành công", f"{c['connected_ok']}/{c['requested_clients']}")
    line("Tỷ lệ kết nối thành công", c["connect_success_rate_pct"], "%")
    line("Thời gian connect trung bình", c["avg_connect_time_ms"], " ms")

    print("\n📡 Publish (Ingest → Backend):")
    p = report["publish"]
    line("Tổng số gói telemetry đã gửi", p["total_telemetry_sent"])
    line("Số lỗi ingest (HTTP)", p["http_ingest_errors"])
    line("Độ trễ ingest trung bình", p["avg_http_ingest_latency_ms"], " ms")
    line("Độ trễ ingest P95", p["p95_http_ingest_latency_ms"], " ms")

    print("\n⚡ Độ trễ Real-time Broadcast (ingest → client nhận qua Socket.IO):")
    lat = report["realtime_delivery_latency_ms"]
    line("Số mẫu đo được", lat["sample_count"])
    line("Min / Avg / Max", f"{lat['min']} / {lat['avg']} / {lat['max']}", " ms")
    line("P50 / P90 / P95 / P99", f"{lat['p50']} / {lat['p90']} / {lat['p95']} / {lat['p99']}", " ms")

    print("\n📦 Tỷ lệ nhận gói (Delivery rate):")
    d = report["delivery_rate"]
    line("Trung bình mỗi client nhận được", d["avg_pct_per_client"], "%")
    line("Client nhận ít nhất (worst case)", d["min_pct_per_client"], "%")

    if report["fault_tolerance"]:
        print("\n💥 Khả năng chịu lỗi (Fault Tolerance / Reconnect):")
        f = report["fault_tolerance"]
        line("Client bị ngắt kết nối trong lúc test", f["clients_disconnected_during_test"])
        line("Client tự reconnect thành công", f["clients_reconnected_ok"])
        line("Tỷ lệ reconnect thành công", f["reconnect_success_rate_pct"], "%")
        line("Thời gian reconnect trung bình", f["avg_reconnect_time_ms"], " ms")
        line("Thời gian reconnect tối đa", f["max_reconnect_time_ms"], " ms")

    print("-" * 78)


def save_outputs(report, all_stats, publish_log, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")

    json_path = os.path.join(out_dir, f"socketio_load_test_{ts}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    csv_path = os.path.join(out_dir, f"socketio_load_test_latencies_{ts}.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["client_id", "connected", "connect_time_ms", "num_received",
                          "avg_latency_ms", "was_disconnected", "reconnect_success", "reconnect_time_ms"])
        for s in all_stats:
            avg_lat = round(statistics.mean(s.latencies_ms), 2) if s.latencies_ms else ""
            writer.writerow([
                s.client_id, s.connected, round(s.connect_time_ms, 2) if s.connect_time_ms else "",
                len(s.received_seqs), avg_lat, s.was_disconnected, s.reconnect_success,
                round(s.reconnect_time_ms, 2) if s.reconnect_time_ms else "",
            ])

    print(f"\n💾 Đã lưu báo cáo chi tiết:\n   - {json_path}\n   - {csv_path}")
    return json_path, csv_path


def main():
    parser = argparse.ArgumentParser(description="AR-IMMS Socket.IO Load & Fault-Tolerance Test")
    parser.add_argument("--server", default="http://localhost:9999", help="URL backend (mặc định http://localhost:9999)")
    parser.add_argument("--clients", type=int, default=50, help="Số client Socket.IO mô phỏng đồng thời")
    parser.add_argument("--duration", type=int, default=60, help="Thời lượng chạy test (giây)")
    parser.add_argument("--publish-interval", type=float, default=1.0, help="Chu kỳ publish telemetry (giây)")
    parser.add_argument("--node-id", default="SRV-NODE-01", help="Node ID dùng để publish telemetry test")
    parser.add_argument("--fault-test", action="store_true", help="Bật kiểm thử khả năng chịu lỗi (ngắt kết nối giữa chừng)")
    parser.add_argument("--disconnect-ratio", type=float, default=0.3, help="Tỷ lệ client bị ngắt khi bật --fault-test")
    parser.add_argument("--disconnect-at", type=float, default=None, help="Thời điểm (giây) ngắt kết nối (mặc định: giữa bài test)")
    parser.add_argument("--output-dir", default="./results", help="Thư mục lưu kết quả JSON/CSV")
    args = parser.parse_args()

    if args.disconnect_at is None:
        args.disconnect_at = args.duration / 2

    all_stats, publish_log, seq_counter, total_duration = asyncio.run(main_async(args))
    report = build_report(all_stats, publish_log, seq_counter, total_duration, args)
    print_report(report)
    save_outputs(report, all_stats, publish_log, args.output_dir)


if __name__ == "__main__":
    main()
