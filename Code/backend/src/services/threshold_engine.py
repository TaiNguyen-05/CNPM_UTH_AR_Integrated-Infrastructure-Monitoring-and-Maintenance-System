import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from infrastructure.databases.db_session import db_session
from infrastructure.models.ar_models import ServerNodeModel, AlertModel, MaintenanceTicketModel, UserModel


class ThresholdRule:
    def __init__(self, metric_name: str, warning_val: float, critical_val: float, unit: str = "%"):
        self.metric_name = metric_name
        self.warning_val = warning_val
        self.critical_val = critical_val
        self.unit = unit

    def evaluate(self, value: float) -> Optional[str]:
        """Trả về 'CRITICAL', 'WARNING' hoặc None nếu an toàn."""
        if value >= self.critical_val:
            return "CRITICAL"
        elif value >= self.warning_val:
            return "WARNING"
        return None


class ThresholdEngine:
    """
    Engine đánh giá ngưỡng Telemetry thời gian thực,
    quản lý vòng đời cảnh báo (Alert Lifecycle) và tự động sinh phiếu bảo trì (Ticket Automation).
    """

    RULES = {
        "cpu": ThresholdRule("cpu", warning_val=75.0, critical_val=90.0, unit="%"),
        "ram": ThresholdRule("ram", warning_val=80.0, critical_val=92.0, unit="%"),
        "disk": ThresholdRule("disk", warning_val=85.0, critical_val=95.0, unit="%"),
        "temp": ThresholdRule("temp", warning_val=65.0, critical_val=80.0, unit="°C"),
    }

    @classmethod
    def get_rules(cls) -> Dict[str, Dict[str, Any]]:
        """Trả về cấu hình các ngưỡng cảnh báo hiện hành."""
        return {
            metric: {
                "metric_name": rule.metric_name,
                "warning_val": rule.warning_val,
                "critical_val": rule.critical_val,
                "unit": rule.unit
            }
            for metric, rule in cls.RULES.items()
        }

    @classmethod
    def update_rule(cls, metric_name: str, warning_val: Optional[float] = None, critical_val: Optional[float] = None, unit: Optional[str] = None) -> bool:
        """Cập nhật động ngưỡng cảnh báo tại runtime."""
        if metric_name not in cls.RULES:
            if warning_val is not None and critical_val is not None:
                cls.RULES[metric_name] = ThresholdRule(metric_name, warning_val, critical_val, unit or "%")
                return True
            return False
        
        rule = cls.RULES[metric_name]
        if warning_val is not None:
            rule.warning_val = float(warning_val)
        if critical_val is not None:
            rule.critical_val = float(critical_val)
        if unit is not None:
            rule.unit = unit
        return True

    @classmethod
    def set_rules(cls, rules_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Cập nhật hàng loạt cấu hình ngưỡng từ API."""
        updated = {}
        for metric, conf in rules_dict.items():
            if isinstance(conf, dict):
                w = conf.get("warning_val", conf.get("warning"))
                c = conf.get("critical_val", conf.get("critical"))
                u = conf.get("unit")
                if w is not None or c is not None:
                    cls.update_rule(metric, w, c, u)
                    updated[metric] = cls.RULES[metric]
        return cls.get_rules()

    @classmethod
    def evaluate_node_telemetry(
        cls, 
        node_id: str, 
        telemetry: Dict[str, Any],
        socketio=None,
        session=None,
        node=None
    ) -> Dict[str, Any]:
        """
        Đánh giá toàn bộ các chỉ số của node, ghi nhận Alert và tự động sinh Ticket nếu CRITICAL.
        Hỗ trợ cơ chế chống spam (De-duplication). Tối ưu hóa hiệu năng tái sử dụng DB Session.
        """
        own_session = False
        if session is None:
            session = db_session()
            own_session = True

        created_alerts = []
        created_tickets = []
        highest_severity = "HEALTHY"

        try:
            if node is None:
                node = session.query(ServerNodeModel).filter(ServerNodeModel.id == node_id).first()
            if not node:
                return {"error": f"Node {node_id} not found"}

            # Cập nhật thời gian nhận heartbeat gần nhất
            node.last_heartbeat_at = datetime.utcnow()
            node.metrics_json = json.dumps(telemetry)
            if "containers" in telemetry:
                node.containers_json = json.dumps(telemetry["containers"])

            # Đánh giá từng chỉ số
            metric_checks = [
                ("cpu", float(telemetry.get("cpu", 0.0))),
                ("ram", float(telemetry.get("ram", 0.0))),
                ("disk", float(telemetry.get("disk", 0.0))),
                ("temp", float(telemetry.get("temp", 0.0))),
            ]

            # Lấy danh sách alert đang mở (OPEN hoặc ACKNOWLEDGED) của node này để chống spam
            existing_alerts = session.query(AlertModel).filter(
                AlertModel.server_node_id == node_id,
                AlertModel.status.in_(["OPEN", "ACKNOWLEDGED"])
            ).all()
            existing_alerts_by_metric = {a.metric_name: a for a in existing_alerts}

            # Nếu node vừa kết nối lại thành công, tự động giải quyết cảnh báo Heartbeat Lost
            heartbeat_alert = existing_alerts_by_metric.get("heartbeat")
            if heartbeat_alert:
                heartbeat_alert.status = "RESOLVED"
                heartbeat_alert.resolved_at = datetime.utcnow()
                heartbeat_alert.updated_at = datetime.utcnow()
                del existing_alerts_by_metric["heartbeat"]

            for metric_name, value in metric_checks:
                rule = cls.RULES.get(metric_name)
                if not rule:
                    continue

                severity = rule.evaluate(value)
                if severity:
                    # Xác định mức độ nghiêm trọng chung của node
                    if severity == "CRITICAL":
                        highest_severity = "CRITICAL"
                    elif severity == "WARNING" and highest_severity != "CRITICAL":
                        highest_severity = "WARNING"

                    # Kiểm tra xem đã có Alert chưa
                    existing_alert = existing_alerts_by_metric.get(metric_name)

                    if existing_alert:
                        # Đã có cảnh báo: cập nhật giá trị mới nhất
                        existing_alert.metric_value = value
                        existing_alert.updated_at = datetime.utcnow()

                        # Nếu từ WARNING leo thang lên CRITICAL
                        if existing_alert.severity == "WARNING" and severity == "CRITICAL":
                            existing_alert.severity = "CRITICAL"
                            existing_alert.title = f"[CRITICAL] {metric_name.upper()} Exceeded Critical Threshold: {value:.1f}{rule.unit}"
                            existing_alert.threshold_value = rule.critical_val

                            # Kiểm tra xem đã có Ticket chưa, nếu chưa thì tự động tạo Ticket
                            existing_ticket = session.query(MaintenanceTicketModel).filter(
                                MaintenanceTicketModel.alert_id == existing_alert.id,
                                MaintenanceTicketModel.status.in_(["CREATED", "ASSIGNED", "IN_PROGRESS"])
                            ).first()

                            if not existing_ticket:
                                ticket = cls._create_auto_ticket(session, node, existing_alert)
                                created_tickets.append(ticket)
                    else:
                        # Tạo mới Alert
                        alert_id = f"ALT-{datetime.utcnow().year}-{uuid.uuid4().hex[:4].upper()}"
                        thresh_val = rule.critical_val if severity == "CRITICAL" else rule.warning_val
                        title = f"[{severity}] {metric_name.upper()} Exceeded Limit ({value:.1f}{rule.unit} >= {thresh_val:.1f}{rule.unit})"
                        message = (
                            f"Server Node {node.name} ({node.id}) reported {metric_name.upper()} utilization of "
                            f"{value:.1f}{rule.unit}, which violates the safety threshold of {thresh_val:.1f}{rule.unit}. "
                            f"Immediate inspection recommended via AR HUD Scanner."
                        )

                        new_alert = AlertModel(
                            id=alert_id,
                            server_node_id=node_id,
                            severity=severity,
                            title=title,
                            message=message,
                            metric_name=metric_name,
                            metric_value=value,
                            threshold_value=thresh_val,
                            status="OPEN",
                            created_at=datetime.utcnow(),
                            updated_at=datetime.utcnow()
                        )
                        session.add(new_alert)
                        session.flush()
                        created_alerts.append(new_alert)

                        # Tự động tạo Maintenance Ticket nếu là mức CRITICAL
                        if severity == "CRITICAL":
                            ticket = cls._create_auto_ticket(session, node, new_alert)
                            created_tickets.append(ticket)

            # Cập nhật trạng thái node
            if highest_severity == "CRITICAL":
                node.status = "CRITICAL"
            elif highest_severity == "WARNING":
                node.status = "WARNING"
            else:
                node.status = "HEALTHY"

            session.commit()

            # Broadcast WebSocket events nếu socketio được cung cấp
            if socketio:
                for alert in created_alerts:
                    socketio.emit("alert_created", {
                        "id": alert.id,
                        "server_node_id": alert.server_node_id,
                        "severity": alert.severity,
                        "title": alert.title,
                        "message": alert.message,
                        "metric_name": alert.metric_name,
                        "metric_value": alert.metric_value,
                        "threshold_value": alert.threshold_value,
                        "status": alert.status,
                        "created_at": alert.created_at.isoformat() if alert.created_at else None
                    })

                for ticket in created_tickets:
                    socketio.emit("ticket_created", {
                        "id": ticket.id,
                        "server_node_id": ticket.server_node_id,
                        "alert_id": ticket.alert_id,
                        "title": ticket.title,
                        "description": ticket.description,
                        "priority": ticket.priority,
                        "status": ticket.status,
                        "assigned_technician_id": ticket.assigned_technician_id,
                        "assigned_technician_name": ticket.assigned_technician_name,
                        "created_at": ticket.created_at.isoformat() if ticket.created_at else None
                    })

                if created_alerts or created_tickets:
                    socketio.emit("stats_updated", {
                        "timestamp": datetime.utcnow().isoformat()
                    })

            return {
                "node_id": node_id,
                "node_status": node.status,
                "alerts_created": len(created_alerts),
                "tickets_created": len(created_tickets)
            }

        except Exception as e:
            session.rollback()
            print(f"[ThresholdEngine] Lỗi xử lý telemetry cho {node_id}: {e}")
            return {"error": str(e)}
        finally:
            if own_session:
                session.close()

    @classmethod
    def _create_auto_ticket(
        cls, 
        session, 
        node: ServerNodeModel, 
        alert: AlertModel
    ) -> MaintenanceTicketModel:
        """Tạo phiếu bảo trì tự động và gán cho Kỹ thuật viên khả dụng."""
        # Tìm kỹ thuật viên khả dụng
        tech_user = session.query(UserModel).filter(
            UserModel.role == "TECHNICIAN"
        ).first()

        tech_id = tech_user.id if tech_user else "USR-003"
        tech_name = tech_user.full_name if tech_user else "Nguyen Van B (Field Tech)"

        ticket_id = f"TCK-{datetime.utcnow().year}-{uuid.uuid4().hex[:4].upper()}"
        ticket_title = f"[AUTO-DISPATCH] Resolve {alert.title}"
        ticket_desc = (
            f"Hệ thống tự động phát hiện sự cố nghiêm trọng trên máy chủ {node.name} (Rack: {node.rack_id}, Slot: U{node.u_start}).\n"
            f"- Cảnh báo kích hoạt: {alert.id} ({alert.metric_name.upper()}: {alert.metric_value})\n"
            f"- Yêu cầu: Sử dụng ứng dụng Mobile AR quét mã QR '{node.qr_code_payload}' để kiểm tra linh kiện và xử lý tại chỗ."
        )

        ticket = MaintenanceTicketModel(
            id=ticket_id,
            server_node_id=node.id,
            alert_id=alert.id,
            title=ticket_title,
            description=ticket_desc,
            priority="CRITICAL",
            status="ASSIGNED",
            assigned_technician_id=tech_id,
            assigned_technician_name=tech_name,
            created_by="SYSTEM_AUTO_ENGINE",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(ticket)
        session.flush()
        return ticket
