import time
import uuid
import threading
from datetime import datetime, timedelta

from infrastructure.databases.db_session import db_session
from infrastructure.models.ar_models import ServerNodeModel, AlertModel


class HeartbeatWatchdog:
    """
    Background Watchdog Daemon giám sát nhịp tim (Heartbeat) của các Server Node.

    Nếu quá 90 giây không nhận được Telemetry từ Collector Agent,
    tự động đánh dấu Server Node là OFFLINE và tạo Alert.
    """

    def __init__(
        self,
        socketio=None,
        timeout_seconds: int = 90,
        check_interval: int = 10
    ):
        self.socketio = socketio
        self.timeout_seconds = timeout_seconds
        self.check_interval = check_interval

        self._running = False
        self._thread = None

    def start(self):
        """Khởi động Watchdog background thread."""

        if self._running:
            return

        self._running = True

        self._thread = threading.Thread(
            target=self._run_loop,
            daemon=True,
            name="HeartbeatWatchdogThread"
        )

        self._thread.start()

        print(
            f"[Watchdog] Heartbeat Watchdog Daemon started "
            f"(timeout={self.timeout_seconds}s, "
            f"interval={self.check_interval}s)"
        )

    def stop(self):
        """Dừng Watchdog."""

        self._running = False

    def _run_loop(self):
        """Vòng lặp chính của Watchdog."""

        while self._running:

            try:
                self.check_stale_nodes()

            except Exception as e:
                print(
                    f"[Watchdog] Error in watchdog loop: {e}"
                )

            time.sleep(self.check_interval)

    def check_stale_nodes(self):
        """
        Quét các Server Node bị mất heartbeat.

        Nếu last_heartbeat_at quá timeout_seconds:
        - Chuyển status -> OFFLINE
        - Tạo Alert Heartbeat Lost nếu chưa có Alert OPEN
        """

        session = db_session()

        threshold_time = datetime.utcnow() - timedelta(
            seconds=self.timeout_seconds
        )

        try:

            stale_nodes = session.query(
                ServerNodeModel
            ).filter(
                ServerNodeModel.status != "OFFLINE",

                (
                    (ServerNodeModel.last_heartbeat_at < threshold_time)
                    |
                    (ServerNodeModel.last_heartbeat_at.is_(None))
                )

            ).all()

            for node in stale_nodes:

                old_status = node.status

                # ==========================================
                # 1. Chuyển Server Node thành OFFLINE
                # ==========================================

                node.status = "OFFLINE"
                node.updated_at = datetime.utcnow()

                # ==========================================
                # 2. Kiểm tra Alert Heartbeat hiện tại
                # ==========================================

                existing_alert = session.query(
                    AlertModel
                ).filter(

                    AlertModel.server_node_id == node.id,

                    AlertModel.metric_name == "heartbeat",

                    AlertModel.status.in_(
                        ["OPEN", "ACKNOWLEDGED"]
                    )

                ).first()

                new_alert = None

                # ==========================================
                # 3. Tạo Alert nếu chưa tồn tại
                # ==========================================

                if not existing_alert:

                    alert_id = (
                        f"ALT-"
                        f"{datetime.utcnow().year}-"
                        f"{uuid.uuid4().hex[:4].upper()}"
                    )

                    new_alert = AlertModel(

                        id=alert_id,

                        server_node_id=node.id,

                        severity="CRITICAL",

                        title=(
                            f"[OFFLINE] "
                            f"Server Node Heartbeat Lost "
                            f"(> {self.timeout_seconds}s)"
                        ),

                        message=(
                            f"Máy chủ {node.name} ({node.id}) "
                            f"đã ngừng gửi dữ liệu Telemetry quá "
                            f"{self.timeout_seconds}s. "

                            f"Thời gian heartbeat cuối: "
                            f"{node.last_heartbeat_at or 'Chưa từng ghi nhận'}. "

                            f"Trạng thái máy chủ đã tự động "
                            f"chuyển sang OFFLINE."
                        ),

                        metric_name="heartbeat",

                        metric_value=0.0,

                        threshold_value=float(
                            self.timeout_seconds
                        ),

                        status="OPEN",

                        # QUAN TRỌNG:
                        # AlertModel dùng triggered_at,
                        # KHÔNG dùng created_at / updated_at.
                        triggered_at=datetime.utcnow()
                    )

                    session.add(new_alert)

                # ==========================================
                # 4. Commit database
                # ==========================================

                session.commit()

                print(
                    f"[Watchdog] Node {node.id} "
                    f"({node.name}) marked as OFFLINE "
                    f"(was {old_status})"
                )

                # ==========================================
                # 5. Broadcast WebSocket
                # ==========================================

                if self.socketio:

                    self.socketio.emit(
                        "server_status_changed",
                        {
                            "node_id": node.id,

                            "node_name": node.name,

                            "rack_id": (
                                str(node.rack_id)
                                if node.rack_id
                                else None
                            ),

                            "status": "OFFLINE",

                            "previous_status": old_status,

                            "reason": (
                                f"Heartbeat timeout "
                                f"(> {self.timeout_seconds}s)"
                            ),

                            "timestamp": datetime.utcnow().isoformat()
                        }
                    )

                    # ======================================
                    # 6. Broadcast Alert mới
                    # ======================================

                    if new_alert:

                        self.socketio.emit(
                            "alert_created",
                            {
                                "id": new_alert.id,

                                "server_node_id":
                                    new_alert.server_node_id,

                                "severity":
                                    new_alert.severity,

                                "title":
                                    new_alert.title,

                                "message":
                                    new_alert.message,

                                "metric_name":
                                    new_alert.metric_name,

                                "status":
                                    new_alert.status,

                                "triggered_at":
                                    (
                                        new_alert.triggered_at.isoformat()
                                        if new_alert.triggered_at
                                        else None
                                    )
                            }
                        )

                    # ======================================
                    # 7. Cập nhật statistics
                    # ======================================

                    self.socketio.emit(
                        "stats_updated",
                        {
                            "timestamp":
                                datetime.utcnow().isoformat()
                        }
                    )

        except Exception as e:

            session.rollback()

            print(
                f"[Watchdog] Lỗi khi quét nodes "
                f"mất kết nối: {e}"
            )

        finally:

            session.close()