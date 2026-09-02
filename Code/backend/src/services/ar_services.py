import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from domain.models.server_node import ServerNode
from domain.models.rack import Rack
from domain.models.alert import Alert
from domain.models.ticket import MaintenanceTicket
from domain.models.user_account import UserAccount
from domain.models.interfaces import (
    INodeRepository, IRackRepository, IAlertRepository, ITicketRepository, IUserRepository
)
from .base_service import BaseService


class NodeService(BaseService[ServerNode]):
    """Dịch vụ nghiệp vụ quản lý Server Nodes."""

    def __init__(self, repository: INodeRepository):
        super().__init__(repository)
        self.node_repo = repository

    def create_node(self, data: Dict[str, Any]) -> ServerNode:
        node_id = data.get("id") or f"SRV-NODE-{uuid.uuid4().hex[:6].upper()}"
        qr_code = data.get("qr_code_payload") or f"ar-imms://node/{node_id}"
        
        node = ServerNode(
            id=node_id,
            rack_id=data["rack_id"],
            name=data["name"],
            u_start=data["u_start"],
            u_height=data.get("u_height", 2),
            ip_address=data.get("ip_address", "127.0.0.1"),
            mac_address=data.get("mac_address"),
            model=data.get("model", "Generic Server"),
            cpu_model=data.get("cpu_model", "Multi-Core CPU"),
            ram_total_gb=data.get("ram_total_gb", 32),
            disk_total_gb=data.get("disk_total_gb", 1000),
            qr_code_payload=qr_code,
            status=data.get("status", "HEALTHY"),
            metrics=data.get("metrics"),
            containers=data.get("containers"),
        )
        return self.create(node)

    def get_by_qr(self, qr_payload: str) -> Optional[ServerNode]:
        """Dành cho ứng dụng di động AR quét mã QR trên vỏ máy chủ."""
        return self.node_repo.get_by_qr_code(qr_payload)

    def update_telemetry(self, node_id: str, cpu: float, ram: float, disk: float, temp: float, net_in: float = 0.0, net_out: float = 0.0) -> ServerNode:
        node = self.get_by_id(node_id)
        if not node:
            raise ValueError(f"Không tìm thấy Server Node với ID: {node_id}")
        node.update_telemetry(cpu=cpu, ram=ram, disk=disk, temp=temp, net_in=net_in, net_out=net_out)
        return self.update(node)


class RackService(BaseService[Rack]):
    """Dịch vụ nghiệp vụ quản lý Tủ Rack."""

    def __init__(self, repository: IRackRepository):
        super().__init__(repository)
        self.rack_repo = repository

    def create_rack(self, data: Dict[str, Any]) -> Rack:
        rack_id = data.get("id") or f"rack-{uuid.uuid4().hex[:6].lower()}"
        code = data.get("code") or rack_id.upper()
        
        rack = Rack(
            id=rack_id,
            name=data["name"],
            code=code,
            room_name=data.get("room_name", "Server Room 01"),
            total_u=data.get("total_u", 42),
            power_limit_kw=data.get("power_limit_kw", 10.0),
            x_coord=data.get("x_coord", 0.0),
            y_coord=data.get("y_coord", 0.0),
        )
        return self.create(rack)

    def get_by_code(self, code: str) -> Optional[Rack]:
        return self.rack_repo.get_by_code(code)


class AlertService(BaseService[Alert]):
    """Dịch vụ nghiệp vụ quản lý Cảnh báo sự cố."""

    def __init__(self, repository: IAlertRepository):
        super().__init__(repository)
        self.alert_repo = repository

    def create_alert(self, data: Dict[str, Any]) -> Alert:
        alert_id = data.get("id") or f"ALT-{datetime.utcnow().year}-{uuid.uuid4().hex[:4].upper()}"
        alert = Alert(
            id=alert_id,
            server_node_id=data["server_node_id"],
            title=data["title"],
            message=data.get("message", ""),
            severity=data.get("severity", "WARNING"),
            metric_name=data.get("metric_name", "cpu"),
            metric_value=data.get("metric_value", 0.0),
            threshold_value=data.get("threshold_value", 80.0),
            status=data.get("status", "OPEN"),
        )
        return self.create(alert)

    def list_active(self) -> List[Alert]:
        return self.alert_repo.list_active()

    def list_by_node(self, node_id: str) -> List[Alert]:
        return self.alert_repo.list_by_node(node_id)

    def acknowledge_alert(self, alert_id: str, user_id: str) -> Alert:
        alert = self.get_by_id(alert_id)
        if not alert:
            raise ValueError(f"Không tìm thấy cảnh báo ID: {alert_id}")
        alert.acknowledge(user_id)
        return self.update(alert)

    def resolve_alert(self, alert_id: str, user_id: str) -> Alert:
        alert = self.get_by_id(alert_id)
        if not alert:
            raise ValueError(f"Không tìm thấy cảnh báo ID: {alert_id}")
        alert.resolve(user_id)
        return self.update(alert)


class TicketService(BaseService[MaintenanceTicket]):
    """Dịch vụ nghiệp vụ quản lý Phiếu bảo trì AR."""

    def __init__(self, repository: ITicketRepository):
        super().__init__(repository)
        self.ticket_repo = repository

    def create_ticket(self, data: Dict[str, Any]) -> MaintenanceTicket:
        ticket_id = data.get("id") or f"TCK-{datetime.utcnow().year}-{uuid.uuid4().hex[:4].upper()}"
        ticket = MaintenanceTicket(
            id=ticket_id,
            server_node_id=data["server_node_id"],
            title=data["title"],
            description=data.get("description", ""),
            priority=data.get("priority", "MEDIUM"),
            status=data.get("status", "CREATED"),
            alert_id=data.get("alert_id"),
            assigned_technician_id=data.get("assigned_technician_id"),
            assigned_technician_name=data.get("assigned_technician_name"),
            created_by=data.get("created_by"),
        )
        return self.create(ticket)

    def assign_technician(self, ticket_id: str, tech_id: str, tech_name: Optional[str] = None) -> MaintenanceTicket:
        ticket = self.get_by_id(ticket_id)
        if not ticket:
            raise ValueError(f"Không tìm thấy phiếu bảo trì ID: {ticket_id}")
        ticket.assign_to(technician_id=tech_id, technician_name=tech_name)
        return self.update(ticket)

    def add_ar_log(self, ticket_id: str, action: str, details: Dict[str, Any]) -> MaintenanceTicket:
        ticket = self.get_by_id(ticket_id)
        if not ticket:
            raise ValueError(f"Không tìm thấy phiếu bảo trì ID: {ticket_id}")
        ticket.add_ar_log(action, details)
        return self.update(ticket)

    def resolve_ticket(self, ticket_id: str, notes: str) -> MaintenanceTicket:
        ticket = self.get_by_id(ticket_id)
        if not ticket:
            raise ValueError(f"Không tìm thấy phiếu bảo trì ID: {ticket_id}")
        ticket.resolve(notes)
        return self.update(ticket)

    def close_ticket(self, ticket_id: str) -> MaintenanceTicket:
        ticket = self.get_by_id(ticket_id)
        if not ticket:
            raise ValueError(f"Không tìm thấy phiếu bảo trì ID: {ticket_id}")
        ticket.close()
        return self.update(ticket)


class UserService(BaseService[UserAccount]):
    """Dịch vụ nghiệp vụ quản lý Tài khoản người dùng."""

    def __init__(self, repository: IUserRepository):
        super().__init__(repository)
        self.user_repo = repository

    def create_user(self, data: Dict[str, Any]) -> UserAccount:
        user_id = data.get("id") or f"USR-{uuid.uuid4().hex[:4].upper()}"
        user = UserAccount(
            id=user_id,
            email=data["email"],
            full_name=data["full_name"],
            role=data.get("role", "TECHNICIAN"),
            status=data.get("status", "PENDING_APPROVAL"),
            phone_number=data.get("phone_number"),
            department=data.get("department", "Infrastructure Ops"),
            avatar=data.get("avatar"),
            password_hash=data.get("password_hash"),
        )
        return self.create(user)

    def get_by_email(self, email: str) -> Optional[UserAccount]:
        return self.user_repo.get_by_email(email)

    def list_pending(self) -> List[UserAccount]:
        return self.user_repo.list_pending()

    def approve_user(self, user_id: str, approver_id: str) -> UserAccount:
        user = self.get_by_id(user_id)
        if not user:
            raise ValueError(f"Không tìm thấy người dùng ID: {user_id}")
        user.approve(approver_id)
        return self.update(user)

    def lock_user(self, user_id: str) -> UserAccount:
        user = self.get_by_id(user_id)
        if not user:
            raise ValueError(f"Không tìm thấy người dùng ID: {user_id}")
        user.lock()
        return self.update(user)
