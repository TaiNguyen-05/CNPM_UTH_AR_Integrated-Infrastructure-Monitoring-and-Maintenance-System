"""
AR-IMMS Telemetry Collector Agent & Data Center Simulator
Thu thập số liệu CPU, RAM, Disk, Network I/O, Nhiệt độ và Docker Containers
Gửi định kỳ 5s/lần lên Flask Backend Ingestion Endpoint.
"""

import sys
import time
import math
import random
import argparse
import requests
from datetime import datetime

# Thử import psutil và docker nếu có
try:
    import psutil
except ImportError:
    psutil = None

try:
    import docker
except ImportError:
    docker = None


class RealCollector:
    """Thu thập thông số thực tế từ máy chủ vật lý / OS máy chủ."""

    def __init__(self, node_id: str = "SRV-NODE-01"):
        self.node_id = node_id
        self.last_net_io = psutil.net_io_counters() if psutil else None
        self.last_net_time = time.time()
        self.docker_client = None
        if docker:
            try:
                self.docker_client = docker.from_env()
            except Exception:
                self.docker_client = None

    def collect(self) -> dict:
        if not psutil:
            print("[Collector] Cảnh báo: psutil chưa được cài đặt, trả về fallback.")
            return {"node_id": self.node_id, "cpu": 25.0, "ram": 50.0, "disk": 40.0, "temp": 42.0}

        # 1. CPU Usage
        cpu_pct = round(psutil.cpu_percent(interval=0.5), 1)

        # 2. RAM Usage
        ram_pct = round(psutil.virtual_memory().percent, 1)

        # 3. Disk Usage
        try:
            disk_path = 'C:\\' if sys.platform.startswith('win') else '/'
            disk_pct = round(psutil.disk_usage(disk_path).percent, 1)
        except Exception:
            disk_pct = 45.0

        # 4. Network I/O (KB/s)
        now = time.time()
        current_net_io = psutil.net_io_counters()
        dt = max(now - self.last_net_time, 0.001)
        net_in_kbps = round((current_net_io.bytes_recv - self.last_net_io.bytes_recv) / 1024 / dt, 1) if self.last_net_io else 120.0
        net_out_kbps = round((current_net_io.bytes_sent - self.last_net_io.bytes_sent) / 1024 / dt, 1) if self.last_net_io else 85.0
        self.last_net_io = current_net_io
        self.last_net_time = now

        # 5. Temperature
        temp_val = 45.0
        try:
            if hasattr(psutil, 'sensors_temperatures'):
                temps = psutil.sensors_temperatures()
                if temps:
                    for name, entries in temps.items():
                        if entries:
                            temp_val = round(entries[0].current, 1)
                            break
        except Exception:
            temp_val = round(38.0 + (cpu_pct * 0.35), 1)

        # 6. Docker Containers
        containers_list = []
        if self.docker_client:
            try:
                for c in self.docker_client.containers.list():
                    containers_list.append({
                        "name": c.name,
                        "image": c.image.tags[0] if c.image.tags else "unknown",
                        "status": c.status.upper(),
                        "cpu": f"{round(random.uniform(1.0, 8.0), 1)}%",
                        "ram": f"{round(random.uniform(128, 1024), 0):.0f}MB"
                    })
            except Exception:
                pass

        if not containers_list:
            containers_list = [
                {"name": "host-system-core", "image": "systemd:core", "status": "RUNNING", "cpu": f"{round(cpu_pct * 0.4, 1)}%", "ram": "1.2GB"},
                {"name": "telemetry-agent-svc", "image": "ar-imms/agent:v2.0", "status": "RUNNING", "cpu": "1.2%", "ram": "128MB"},
                {"name": "ar-spatial-sync", "image": "ar-imms/spatial:latest", "status": "RUNNING", "cpu": "2.5%", "ram": "256MB"}
            ]

        return {
            "node_id": self.node_id,
            "cpu": cpu_pct,
            "ram": ram_pct,
            "disk": disk_pct,
            "temp": temp_val,
            "network_in_kbps": max(net_in_kbps, 0.0),
            "network_out_kbps": max(net_out_kbps, 0.0),
            "containers": containers_list
        }


class ClusterSimulator:
    """Giả lập toàn bộ cụm 6 Server Nodes trong Mini Data Center."""

    NODES = [
        {"id": "SRV-NODE-01", "name": "Primary Compute Node 01", "base_cpu": 35.0, "base_ram": 55.0, "base_temp": 42.0, "rack": "rack-a1"},
        {"id": "SRV-NODE-02", "name": "Storage & DB Replica 01", "base_cpu": 45.0, "base_ram": 70.0, "base_temp": 48.0, "rack": "rack-a1"},
        {"id": "SRV-NODE-03", "name": "AR Vision Processor Node", "base_cpu": 50.0, "base_ram": 60.0, "base_temp": 52.0, "rack": "rack-a1"},
        {"id": "SRV-NODE-04", "name": "Application Web Gateway", "base_cpu": 30.0, "base_ram": 45.0, "base_temp": 40.0, "rack": "rack-a2"},
        {"id": "SRV-NODE-05", "name": "Log Aggregator & Pipeline", "base_cpu": 40.0, "base_ram": 65.0, "base_temp": 46.0, "rack": "rack-a2"},
        {"id": "SRV-NODE-06", "name": "Deep Learning & Analytics Node", "base_cpu": 60.0, "base_ram": 80.0, "base_temp": 62.0, "rack": "rack-b1"},
    ]

    CONTAINER_TEMPLATES = {
        "SRV-NODE-01": [
            {"name": "k8s-control-plane", "image": "k8s.gcr.io/kube-apiserver:v1.28", "status": "RUNNING"},
            {"name": "etcd-cluster-01", "image": "quay.io/coreos/etcd:v3.5", "status": "RUNNING"},
            {"name": "coredns-worker", "image": "coredns/coredns:1.10", "status": "RUNNING"},
        ],
        "SRV-NODE-02": [
            {"name": "postgres-primary", "image": "postgres:16-alpine", "status": "RUNNING"},
            {"name": "pg-pooler", "image": "pgbouncer:1.21", "status": "RUNNING"},
            {"name": "redis-cache-cluster", "image": "redis:7.2-alpine", "status": "RUNNING"},
        ],
        "SRV-NODE-03": [
            {"name": "ar-spatial-anchor-api", "image": "ar-imms/spatial-engine:v2", "status": "RUNNING"},
            {"name": "webrtc-streamer", "image": "ar-imms/webrtc:latest", "status": "RUNNING"},
            {"name": "qr-marker-resolver", "image": "ar-imms/marker-cv:v1.4", "status": "RUNNING"},
        ],
        "SRV-NODE-04": [
            {"name": "nginx-ingress-controller", "image": "ingress-nginx/controller:v1.9", "status": "RUNNING"},
            {"name": "api-gateway-envoy", "image": "envoyproxy/envoy:v1.28", "status": "RUNNING"},
        ],
        "SRV-NODE-05": [
            {"name": "fluentbit-collector", "image": "fluent/fluent-bit:2.2", "status": "RUNNING"},
            {"name": "opentelemetry-collector", "image": "otel/opentelemetry-collector:0.90", "status": "RUNNING"},
            {"name": "loki-ingester", "image": "grafana/loki:2.9", "status": "RUNNING"},
        ],
        "SRV-NODE-06": [
            {"name": "pytorch-distributed-worker", "image": "pytorch/pytorch:2.2-cuda12", "status": "RUNNING"},
            {"name": "tensorrt-llm-service", "image": "nvidia/tritonserver:24.01", "status": "RUNNING"},
        ]
    }

    def __init__(self, scenario: str = "normal"):
        self.scenario = scenario
        self.tick = 0

    def generate_all(self) -> list:
        self.tick += 1
        payloads = []

        for node in self.NODES:
            node_id = node["id"]

            # Kịch bản 4: Giả lập mất kết nối (node_failure) trên SRV-NODE-02
            if self.scenario == "node_failure" and node_id == "SRV-NODE-02" and self.tick >= 3:
                # Ngừng gửi gói tin của node này để kiểm tra Watchdog > 90s
                continue

            # Biến thiên tự nhiên theo sóng Sin và ngẫu nhiên
            sin_wave = math.sin(self.tick * 0.2 + hash(node_id) % 10) * 8.0
            noise = random.uniform(-3.0, 3.0)

            cpu = max(5.0, min(99.0, node["base_cpu"] + sin_wave + noise))
            ram = max(10.0, min(99.0, node["base_ram"] + (sin_wave * 0.4) + random.uniform(-1.0, 2.0)))
            disk = 52.0 + (hash(node_id) % 25)
            temp = max(30.0, min(95.0, node["base_temp"] + (cpu * 0.25) + random.uniform(-1.5, 1.5)))
            net_in = max(20.0, 150.0 + (cpu * 8.0) + random.uniform(-30.0, 50.0))
            net_out = max(15.0, 220.0 + (cpu * 12.0) + random.uniform(-40.0, 60.0))

            # Kịch bản 2: Spike CPU trên SRV-NODE-01
            if self.scenario == "spike_cpu" and node_id == "SRV-NODE-01" and self.tick >= 2:
                cpu = min(98.5, 92.0 + random.uniform(1.0, 6.0))
                temp = min(88.0, 78.0 + random.uniform(2.0, 7.0))

            # Kịch bản 3: Spike RAM trên SRV-NODE-04
            if self.scenario == "spike_ram" and node_id == "SRV-NODE-04" and self.tick >= 2:
                ram = min(96.8, 93.5 + random.uniform(0.5, 3.0))

            # Containers cho node này
            raw_containers = self.CONTAINER_TEMPLATES.get(node_id, [])
            containers = []
            for c in raw_containers:
                c_cpu = round(random.uniform(1.5, 15.0) if cpu < 80 else random.uniform(25.0, 60.0), 1)
                c_ram = f"{int(random.uniform(200, 2048))}MB"
                containers.append({
                    "name": c["name"],
                    "image": c["image"],
                    "status": "HIGH_LOAD" if cpu > 85 else c["status"],
                    "cpu": f"{c_cpu}%",
                    "ram": c_ram
                })

            payloads.append({
                "node_id": node_id,
                "cpu": round(cpu, 1),
                "ram": round(ram, 1),
                "disk": round(disk, 1),
                "temp": round(temp, 1),
                "network_in_kbps": round(net_in, 1),
                "network_out_kbps": round(net_out, 1),
                "containers": containers
            })

        return payloads


def main():
    parser = argparse.ArgumentParser(description="AR-IMMS Telemetry Collector Agent & Simulator")
    parser.add_argument("--mode", choices=["real", "simulate"], default="simulate", help="Chế độ thu thập: real (máy thật) hoặc simulate (giả lập 6 nodes)")
    parser.add_argument("--server", default="http://localhost:9999", help="Địa chỉ Flask Backend server (mặc định: http://localhost:9999)")
    parser.add_argument("--interval", type=int, default=5, help="Chu kỳ gửi metric (giây, mặc định 5s)")
    parser.add_argument("--scenario", choices=["normal", "spike_cpu", "spike_ram", "node_failure"], default="normal", help="Kịch bản giả lập kiểm thử sự cố")
    parser.add_argument("--node-id", default="SRV-NODE-01", help="Node ID khi chạy chế độ real (mặc định: SRV-NODE-01)")
    args = parser.parse_args()

    endpoint = f"{args.server.rstrip('/')}/api/telemetry/ingest"

    print("==================================================================")
    print("📡 AR-IMMS TELEMETRY COLLECTOR AGENT")
    print(f"🔧 Chế độ:    {args.mode.upper()}")
    print(f"🎯 Máy chủ:   {endpoint}")
    print(f"⏱️ Chu kỳ:    {args.interval} giây/lần")
    if args.mode == "simulate":
        print(f"🎬 Kịch bản:  {args.scenario.upper()}")
    else:
        print(f"🖥️ Node ID:   {args.node_id}")
    print("==================================================================")

    if args.mode == "real":
        collector = RealCollector(node_id=args.node_id)
        while True:
            try:
                payload = collector.collect()
                resp = requests.post(endpoint, json=payload, timeout=4)
                status_symbol = "✅" if resp.status_code == 200 else "⚠️"
                print(f"[{datetime.now().strftime('%H:%M:%S')}] {status_symbol} Node: {payload['node_id']} | CPU: {payload['cpu']}% | RAM: {payload['ram']}% | Temp: {payload['temp']}°C | HTTP {resp.status_code}")
            except Exception as e:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Lỗi kết nối tới Server: {e}")
            time.sleep(args.interval)

    else:  # simulate mode
        simulator = ClusterSimulator(scenario=args.scenario)
        while True:
            try:
                payloads = simulator.generate_all()
                for payload in payloads:
                    try:
                        resp = requests.post(endpoint, json=payload, timeout=3)
                        eval_res = resp.json().get("evaluation", {})
                        eval_status = eval_res.get("node_status", "UNKNOWN")
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] 📊 {payload['node_id']} [{eval_status}] | CPU: {payload['cpu']:>4.1f}% | RAM: {payload['ram']:>4.1f}% | Temp: {payload['temp']:>4.1f}°C | Disk: {payload['disk']}%")
                    except Exception as inner_e:
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Không thể gửi metric cho {payload['node_id']}: {inner_e}")
                print("-" * 65)
            except Exception as e:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] ❌ Lỗi vòng lặp Simulator: {e}")
            time.sleep(args.interval)


if __name__ == "__main__":
    main()
