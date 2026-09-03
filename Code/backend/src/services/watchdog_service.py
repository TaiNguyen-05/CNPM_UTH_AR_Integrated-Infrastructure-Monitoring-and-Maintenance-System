import time
import uuid
import threading
from datetime import datetime, timedelta
from infrastructure.databases.db_session import db_session
from infrastructure.models.ar_models import ServerNodeModel, AlertModel


class HeartbeatWatchdog:
    """
    Background Watchdog Daemon giám sát nhịp tim (Heartbeat) của các Server Node.
    Nếu quá 90 giây không nhận được Telemetry từ Collector Agent, tự động đánh dấu OFFLINE.
    """

    def __init__(self, socketio=None, timeout_seconds: int = 90, check_interval: int = 10):
        self.socketio = socketio
        self.timeout_seconds = timeout_seconds
        self.check_interval = check_interval
        self._running = False
        self._thread = None

    def start(self):
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._run_loop, daemon=True, name="HeartbeatWatchdogThread")
        self._thread.start()
        print(f"[Watchdog] Heartbeat Watchdog Daemon started (timeout={self.timeout_seconds}s, interval={self.check_interval}s)")

    def stop(self):
        self._running = False

    def _run_loop(self):
        while self._running:
            try:
                self.check_stale_nodes()
            except Exception as e:
                print(f"[Watchdog] Error in watchdog loop: {e}")
            time.sleep(self.check_interval)

    def check_stale_nodes(self):
        """Quét và phát hiện các node mất kết nối quá thời gian quy định."""
        session = db_session()
        threshold_time = datetime.utcnow() - timedelta(seconds=self.timeout_seconds)

        try:
            # Tìm tất cả nodes đang không ở trạng thái OFFLINE nhưng heartbeat đã quá hạn
            stale_nodes = session.query(ServerNodeModel).filter(
                ServerNodeModel.status != "OFFLINE",
                (ServerNodeModel.last_heartbeat_at < threshold_time) | (ServerNodeModel.last_heartbeat_at.is_(None))
            ).all()

            for node in stale_nodes:
                old_status = node.status
                node.status = "OFFLINE"
                node.updated_at = datetime.utcnow()

                # Tạo cảnh báo Heartbeat Lost nếu chưa có cảnh báo heartbeat OPEN
                existing_alert = session.query(AlertModel).filter(
                    AlertModel.server_node_id == node.id,
                    AlertModel.metric_name == "heartbeat",
                    AlertModel.status.in_(["OPEN", "ACKNOWLEDGED"])
                ).first()

                new_alert = None
                if not existing_alert:
                    alert_id = f"ALT-{datetime.utcnow().year}-{uuid.uuid4().hex[:4].upper()}"
                    new_alert = AlertModel(
                        id=alert_id,
                        server_node_id=node.id,
                        severity="CRITICAL",
                        title=f"[OFFLINE] Server Node Heartbeat Lost (> {self.timeout_seconds}s)",
                        message=(
                            f"Máy chủ {node.name} ({node.id}) đã ngừng gửi dữ liệu Telemetry quá {self.timeout_seconds}s. "
                            f"Thời gian heartbeat cuối: {node.last_heartbeat_at or 'Chưa từng ghi nhận'}. "
                            f"Trạng thái máy chủ đã tự động chuyển sang OFFLINE."
                        ),
                        metric_name="heartbeat",
                        metric_value=0.0,
                        threshold_value=float(self.timeout_seconds),
                        status="OPEN",
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    session.add(new_alert)

                session.commit()
                print(f"[Watchdog] Node {node.id} ({node.name}) marked as OFFLINE (was {old_status})")

                # Broadcast WebSocket events
                if self.socketio:
                    self.socketio.emit("server_status_changed", {
                        "node_id": node.id,
                        "node_name": node.name,
                        "rack_id": node.rack_id,
                        "status": "OFFLINE",
                        "previous_status": old_status,
                        "reason": f"Heartbeat timeout (> {self.timeout_seconds}s)",
                        "timestamp": datetime.utcnow().isoformat()
                    })

                    if new_alert:
                        self.socketio.emit("alert_created", {
                            "id": new_alert.id,
                            "server_node_id": new_alert.server_node_id,
                            "severity": new_alert.severity,
                            "title": new_alert.title,
                            "message": new_alert.message,
                            "metric_name": new_alert.metric_name,
                            "status": new_alert.status,
                            "created_at": new_alert.created_at.isoformat()
                        })

                    self.socketio.emit("stats_updated", {
                        "timestamp": datetime.utcnow().isoformat()
                    })

        except Exception as e:
            session.rollback()
            print(f"[Watchdog] Lỗi khi quét nodes mất kết nối: {e}")
        finally:
            session.close()
