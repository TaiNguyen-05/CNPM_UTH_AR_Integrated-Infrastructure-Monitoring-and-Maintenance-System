import json
from typing import List, Optional, Dict, Any
from domain.models.server_node import ServerNode
from domain.models.rack import Rack
from domain.models.alert import Alert
from domain.models.ticket import MaintenanceTicket
from domain.models.user_account import UserAccount
from domain.models.interfaces import (
    INodeRepository, IRackRepository, IAlertRepository, ITicketRepository, IUserRepository
)
from infrastructure.models.ar_models import (
    ServerNodeModel, RackModel, AlertModel, MaintenanceTicketModel, UserModel
)
from .base_repository import BaseRepository


class NodeRepository(BaseRepository[ServerNode, ServerNodeModel], INodeRepository):
    """Cài đặt Repository cho ServerNode kế thừa BaseRepository và INodeRepository."""

    def __init__(self):
        super().__init__(ServerNodeModel)

    def _to_domain(self, model: ServerNodeModel) -> ServerNode:
        if not model:
            return None
        metrics = json.loads(model.metrics_json) if model.metrics_json else {}
        containers = json.loads(model.containers_json) if model.containers_json else []
        return ServerNode(
            id=model.id,
            rack_id=model.rack_id,
            name=model.name,
            u_start=model.u_start,
            u_height=model.u_height,
            ip_address=model.ip_address,
            mac_address=model.mac_address,
            model=model.model,
            cpu_model=model.cpu_model,
            ram_total_gb=model.ram_total_gb,
            disk_total_gb=model.disk_total_gb,
            qr_code_payload=model.qr_code_payload,
            status=model.status,
            metrics=metrics,
            containers=containers,
            last_heartbeat_at=model.last_heartbeat_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: ServerNode) -> ServerNodeModel:
        return ServerNodeModel(
            id=entity.id,
            rack_id=entity.rack_id,
            name=entity.name,
            u_start=entity.u_start,
            u_height=entity.u_height,
            ip_address=entity.ip_address,
            mac_address=entity._mac_address,
            model=entity._model,
            cpu_model=entity._cpu_model,
            ram_total_gb=entity.ram_total_gb,
            disk_total_gb=entity.disk_total_gb,
            qr_code_payload=entity.qr_code_payload,
            status=entity.status,
            metrics_json=json.dumps(entity.metrics),
            containers_json=json.dumps(entity.containers),
            last_heartbeat_at=entity._last_heartbeat_at,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    def get_by_qr_code(self, qr_payload: str) -> Optional[ServerNode]:
        session = self._get_session()
        model = session.query(ServerNodeModel).filter_by(qr_code_payload=qr_payload).first()
        return self._to_domain(model) if model else None

    def list_by_rack(self, rack_id: str) -> List[ServerNode]:
        session = self._get_session()
        models = session.query(ServerNodeModel).filter_by(rack_id=rack_id).all()
        return [self._to_domain(m) for m in models]


class RackRepository(BaseRepository[Rack, RackModel], IRackRepository):
    """Cài đặt Repository cho Rack."""

    def __init__(self):
        super().__init__(RackModel)

    def _to_domain(self, model: RackModel) -> Rack:
        if not model:
            return None
        return Rack(
            id=model.id,
            name=model.name,
            code=model.code,
            room_name=model.room_name,
            total_u=model.total_u,
            power_limit_kw=model.power_limit_kw,
            x_coord=model.x_coord,
            y_coord=model.y_coord,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: Rack) -> RackModel:
        return RackModel(
            id=entity.id,
            name=entity.name,
            code=entity.code,
            room_name=entity._room_name,
            total_u=entity.total_u,
            power_limit_kw=entity.power_limit_kw,
            x_coord=entity._x_coord,
            y_coord=entity._y_coord,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    def get_by_code(self, code: str) -> Optional[Rack]:
        session = self._get_session()
        model = session.query(RackModel).filter_by(code=code.upper()).first()
        return self._to_domain(model) if model else None


class AlertRepository(BaseRepository[Alert, AlertModel], IAlertRepository):
    """Cài đặt Repository cho Alert."""

    def __init__(self):
        super().__init__(AlertModel)

    def _to_domain(self, model: AlertModel) -> Alert:
        if not model:
            return None
        return Alert(
            id=model.id,
            server_node_id=model.server_node_id,
            title=model.title,
            message=model.message,
            severity=model.severity,
            metric_name=model.metric_name,
            metric_value=model.metric_value,
            threshold_value=model.threshold_value,
            status=model.status,
            acknowledged_by=model.acknowledged_by,
            acknowledged_at=model.acknowledged_at,
            resolved_by=model.resolved_by,
            resolved_at=model.resolved_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: Alert) -> AlertModel:
        return AlertModel(
            id=entity.id,
            server_node_id=entity.server_node_id,
            title=entity.title,
            message=entity.message,
            severity=entity.severity,
            metric_name=entity._metric_name,
            metric_value=entity._metric_value,
            threshold_value=entity._threshold_value,
            status=entity.status,
            acknowledged_by=entity._acknowledged_by,
            acknowledged_at=entity._acknowledged_at,
            resolved_by=entity._resolved_by,
            resolved_at=entity._resolved_at,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    def list_active(self) -> List[Alert]:
        session = self._get_session()
        models = session.query(AlertModel).filter(AlertModel.status.in_(['OPEN', 'ACKNOWLEDGED'])).order_by(AlertModel.created_at.desc()).all()
        return [self._to_domain(m) for m in models]

    def list_by_node(self, node_id: str) -> List[Alert]:
        session = self._get_session()
        models = session.query(AlertModel).filter_by(server_node_id=node_id).order_by(AlertModel.created_at.desc()).all()
        return [self._to_domain(m) for m in models]


class TicketRepository(BaseRepository[MaintenanceTicket, MaintenanceTicketModel], ITicketRepository):
    """Cài đặt Repository cho MaintenanceTicket."""

    def __init__(self):
        super().__init__(MaintenanceTicketModel)

    def _to_domain(self, model: MaintenanceTicketModel) -> MaintenanceTicket:
        if not model:
            return None
        ar_logs = json.loads(model.ar_session_log_json) if model.ar_session_log_json else []
        return MaintenanceTicket(
            id=model.id,
            server_node_id=model.server_node_id,
            alert_id=model.alert_id,
            title=model.title,
            description=model.description,
            priority=model.priority,
            status=model.status,
            assigned_technician_id=model.assigned_technician_id,
            assigned_technician_name=model.assigned_technician_name,
            created_by=model.created_by,
            resolution_notes=model.resolution_notes,
            ar_session_logs=ar_logs,
            started_at=model.started_at,
            resolved_at=model.resolved_at,
            closed_at=model.closed_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: MaintenanceTicket) -> MaintenanceTicketModel:
        return MaintenanceTicketModel(
            id=entity.id,
            server_node_id=entity.server_node_id,
            alert_id=entity._alert_id,
            title=entity.title,
            description=entity._description,
            priority=entity.priority,
            status=entity.status,
            assigned_technician_id=entity._assigned_technician_id,
            assigned_technician_name=entity._assigned_technician_name,
            created_by=entity._created_by,
            resolution_notes=entity._resolution_notes,
            ar_session_log_json=json.dumps(entity._ar_session_logs),
            started_at=entity._started_at,
            resolved_at=entity._resolved_at,
            closed_at=entity._closed_at,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    def list_by_technician(self, technician_id: str) -> List[MaintenanceTicket]:
        session = self._get_session()
        models = session.query(MaintenanceTicketModel).filter_by(assigned_technician_id=technician_id).order_by(MaintenanceTicketModel.created_at.desc()).all()
        return [self._to_domain(m) for m in models]

    def list_by_status(self, status: str) -> List[MaintenanceTicket]:
        session = self._get_session()
        models = session.query(MaintenanceTicketModel).filter_by(status=status).order_by(MaintenanceTicketModel.created_at.desc()).all()
        return [self._to_domain(m) for m in models]


class UserRepository(BaseRepository[UserAccount, UserModel], IUserRepository):
    """Cài đặt Repository cho UserAccount."""

    def __init__(self):
        super().__init__(UserModel)

    def _to_domain(self, model: UserModel) -> UserAccount:
        if not model:
            return None
        return UserAccount(
            id=model.id,
            email=model.email,
            full_name=model.full_name,
            role=model.role,
            status=model.status,
            phone_number=model.phone_number,
            department=model.department,
            avatar=model.avatar,
            password_hash=model.password_hash,
            approved_by=model.approved_by,
            approved_at=model.approved_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: UserAccount) -> UserModel:
        return UserModel(
            id=entity.id,
            email=entity.email,
            full_name=entity.full_name,
            role=entity.role,
            status=entity.status,
            phone_number=entity._phone_number,
            department=entity._department,
            avatar=entity._avatar,
            password_hash=entity._password_hash,
            approved_by=entity._approved_by,
            approved_at=entity._approved_at,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    def get_by_email(self, email: str) -> Optional[UserAccount]:
        session = self._get_session()
        model = session.query(UserModel).filter_by(email=email.strip().lower()).first()
        return self._to_domain(model) if model else None

    def list_pending(self) -> List[UserAccount]:
        session = self._get_session()
        models = session.query(UserModel).filter_by(status='PENDING_APPROVAL').all()
        return [self._to_domain(m) for m in models]
