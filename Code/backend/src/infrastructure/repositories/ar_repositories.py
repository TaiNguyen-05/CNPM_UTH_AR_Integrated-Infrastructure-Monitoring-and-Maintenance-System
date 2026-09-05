import json
from typing import List, Optional

from domain.models.server_node import ServerNode
from domain.models.rack import Rack
from domain.models.alert import Alert
from domain.models.ticket import MaintenanceTicket
from domain.models.user_account import UserAccount

from domain.models.interfaces import (
    INodeRepository,
    IRackRepository,
    IAlertRepository,
    ITicketRepository,
    IUserRepository,
)

from infrastructure.models.ar_models import (
    ServerNodeModel,
    RackModel,
    AlertModel,
    MaintenanceTicketModel,
    UserModel,
)

from .base_repository import BaseRepository
from .user_repository import UserRepository


# ============================================================
# SERVER NODE REPOSITORY
# ============================================================

class NodeRepository(
    BaseRepository[ServerNode, ServerNodeModel],
    INodeRepository
):
    """Repository cho ServerNode."""

    def __init__(self):
        super().__init__(ServerNodeModel)

    def _to_domain(
        self,
        model: ServerNodeModel
    ) -> Optional[ServerNode]:

        if not model:
            return None

        metrics = None
        if model.metrics_json:
            try:
                metrics = json.loads(model.metrics_json)
            except Exception:
                metrics = None

        containers = None
        if model.containers_json:
            try:
                containers = json.loads(model.containers_json)
            except Exception:
                containers = None

        return ServerNode(
            id=str(model.id),
            rack_id=str(model.rack_id),
            name=model.name,
            u_start=model.u_start,
            u_height=model.u_height or 1,
            ip_address=model.ip_address,
            mac_address=model.mac_address,
            model=model.model,
            cpu_model=model.cpu_model,
            ram_total_gb=model.ram_total_gb or 32,
            disk_total_gb=model.disk_total_gb or 1000,
            qr_code_payload=model.qr_code_payload,
            status=str(model.status) if model.status else "HEALTHY",
            metrics=metrics,
            containers=containers,
            last_heartbeat_at=model.last_heartbeat_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(
        self,
        entity: ServerNode
    ) -> ServerNodeModel:

        metrics_str = None
        if entity.metrics:
            metrics_str = json.dumps(entity.metrics)

        containers_str = None
        if entity.containers:
            containers_str = json.dumps(entity.containers)

        return ServerNodeModel(
            id=str(entity.id),
            rack_id=str(entity.rack_id),
            name=entity.name,
            u_start=entity.u_start,
            u_height=entity.u_height,
            ip_address=entity.ip_address,
            mac_address=entity._mac_address if hasattr(entity, '_mac_address') else None,
            model=entity._model if hasattr(entity, '_model') else None,
            cpu_model=entity._cpu_model if hasattr(entity, '_cpu_model') else None,
            ram_total_gb=entity.ram_total_gb,
            disk_total_gb=entity.disk_total_gb,
            qr_code_payload=entity.qr_code_payload,
            status=entity.status,
            metrics_json=metrics_str,
            containers_json=containers_str,
            last_heartbeat_at=entity._last_heartbeat_at if hasattr(entity, '_last_heartbeat_at') else None,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    def get_by_qr_code(
        self,
        qr_payload: str
    ) -> Optional[ServerNode]:

        session = self._get_session()

        try:
            model = (
                session.query(ServerNodeModel)
                .filter(
                    ServerNodeModel.qr_code_payload == qr_payload
                )
                .first()
            )

            return self._to_domain(model) if model else None

        finally:
            session.close()

    def list_by_rack(
        self,
        rack_id: str
    ) -> List[ServerNode]:

        session = self._get_session()

        try:
            models = (
                session.query(ServerNodeModel)
                .filter(
                    ServerNodeModel.rack_id == str(rack_id)
                )
                .all()
            )

            return [
                self._to_domain(model)
                for model in models
            ]

        finally:
            session.close()


# ============================================================
# RACK REPOSITORY
# ============================================================

class RackRepository(
    BaseRepository[Rack, RackModel],
    IRackRepository
):
    """Repository cho Rack."""

    def __init__(self):
        super().__init__(RackModel)

    def _to_domain(
        self,
        model: RackModel
    ) -> Optional[Rack]:

        if not model:
            return None

        return Rack(
            id=str(model.id),
            name=model.name,
            code=model.code,
            room_name=model.room_name or "Server Room 01",
            total_u=model.total_u or 42,
            power_limit_kw=model.power_limit_kw or 10.0,
            x_coord=model.x_coord or 0.0,
            y_coord=model.y_coord or 0.0,
            created_at=model.created_at,
            updated_at=model.updated_at or model.created_at,
        )

    def _to_model(
        self,
        entity: Rack
    ) -> RackModel:

        return RackModel(
            id=str(entity.id),
            name=entity.name,
            code=entity.code,
            room_name=entity._room_name if hasattr(entity, '_room_name') else "Server Room 01",
            total_u=entity.total_u,
            power_limit_kw=entity.power_limit_kw,
            x_coord=entity._x_coord if hasattr(entity, '_x_coord') else 0.0,
            y_coord=entity._y_coord if hasattr(entity, '_y_coord') else 0.0,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    def get_by_code(
        self,
        code: str
    ) -> Optional[Rack]:

        session = self._get_session()

        try:
            model = (
                session.query(RackModel)
                .filter(
                    RackModel.code == code.strip().upper()
                )
                .first()
            )

            return self._to_domain(model) if model else None

        finally:
            session.close()


# ============================================================
# ALERT REPOSITORY
# ============================================================

class AlertRepository(
    BaseRepository[Alert, AlertModel],
    IAlertRepository
):
    """Repository cho Alert."""

    def __init__(self):
        super().__init__(AlertModel)

    def _to_domain(
        self,
        model: AlertModel
    ) -> Optional[Alert]:

        if not model:
            return None

        return Alert(
            id=str(model.id),
            server_node_id=str(model.server_node_id),
            title=model.title,
            message=model.message,
            severity=str(model.severity) if model.severity else "INFO",
            metric_name=model.metric_name,
            metric_value=model.metric_value,
            threshold_value=model.threshold_value,
            status=str(model.status) if model.status else "OPEN",

            acknowledged_by=(
                str(model.acknowledged_by)
                if model.acknowledged_by
                else None
            ),

            acknowledged_at=model.acknowledged_at,

            resolved_by=(
                str(model.resolved_by)
                if model.resolved_by
                else None
            ),

            resolved_at=model.resolved_at,

            created_at=model.created_at,
            updated_at=model.updated_at or model.created_at,
        )

    def _to_model(
        self,
        entity: Alert
    ) -> AlertModel:

        return AlertModel(
            id=str(entity.id),
            server_node_id=str(entity.server_node_id),
            title=entity.title,
            message=entity.message,
            severity=entity.severity,
            metric_name=entity._metric_name if hasattr(entity, '_metric_name') else None,
            metric_value=entity._metric_value if hasattr(entity, '_metric_value') else None,
            threshold_value=entity._threshold_value if hasattr(entity, '_threshold_value') else None,
            status=entity.status,

            acknowledged_by=(
                str(entity._acknowledged_by)
                if hasattr(entity, '_acknowledged_by') and entity._acknowledged_by
                else None
            ),

            acknowledged_at=entity._acknowledged_at if hasattr(entity, '_acknowledged_at') else None,

            resolved_by=(
                str(entity._resolved_by)
                if hasattr(entity, '_resolved_by') and entity._resolved_by
                else None
            ),

            resolved_at=entity._resolved_at if hasattr(entity, '_resolved_at') else None,

            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    def list_active(self) -> List[Alert]:

        session = self._get_session()

        try:
            models = (
                session.query(AlertModel)
                .filter(
                    AlertModel.status.in_(
                        ["OPEN", "ACKNOWLEDGED"]
                    )
                )
                .all()
            )

            return [
                self._to_domain(model)
                for model in models
            ]

        finally:
            session.close()

    def list_by_node(
        self,
        node_id: str
    ) -> List[Alert]:

        session = self._get_session()

        try:
            models = (
                session.query(AlertModel)
                .filter(
                    AlertModel.server_node_id == str(node_id)
                )
                .all()
            )

            return [
                self._to_domain(model)
                for model in models
            ]

        finally:
            session.close()


# ============================================================
# MAINTENANCE TICKET REPOSITORY
# ============================================================

class TicketRepository(
    BaseRepository[MaintenanceTicket, MaintenanceTicketModel],
    ITicketRepository
):
    """Repository cho MaintenanceTicket."""

    def __init__(self):
        super().__init__(MaintenanceTicketModel)

    def _to_domain(
        self,
        model: MaintenanceTicketModel
    ) -> Optional[MaintenanceTicket]:

        if not model:
            return None

        ar_logs = []
        if model.ar_session_log_json:
            try:
                ar_logs = json.loads(model.ar_session_log_json)
            except Exception:
                ar_logs = []

        return MaintenanceTicket(
            id=str(model.id),
            server_node_id=str(model.server_node_id),

            title=model.title,
            description=model.description or "",

            priority=str(model.priority) if model.priority else "MEDIUM",
            status=str(model.status) if model.status else "CREATED",

            alert_id=(
                str(model.alert_id)
                if model.alert_id
                else None
            ),

            assigned_technician_id=(
                str(model.assigned_technician_id)
                if model.assigned_technician_id
                else None
            ),

            assigned_technician_name=model.assigned_technician_name,

            created_by=(
                str(model.created_by)
                if model.created_by
                else None
            ),

            resolution_notes=model.resolution_notes,

            ar_session_logs=ar_logs,

            created_at=model.created_at,
            started_at=model.started_at,
            resolved_at=model.resolved_at,
            closed_at=model.closed_at,

            updated_at=model.updated_at or model.created_at,
        )

    def _to_model(
        self,
        entity: MaintenanceTicket
    ) -> MaintenanceTicketModel:

        ar_logs_str = None
        if hasattr(entity, '_ar_session_logs') and entity._ar_session_logs:
            try:
                ar_logs_str = json.dumps(entity._ar_session_logs)
            except Exception:
                ar_logs_str = str(entity._ar_session_logs)

        return MaintenanceTicketModel(
            id=str(entity.id),

            server_node_id=str(entity.server_node_id),

            alert_id=str(entity._alert_id) if hasattr(entity, '_alert_id') and entity._alert_id else None,

            title=entity.title,

            description=entity._description if hasattr(entity, '_description') else None,

            priority=entity.priority,

            status=entity.status,

            assigned_technician_id=(
                str(entity._assigned_technician_id)
                if hasattr(entity, '_assigned_technician_id') and entity._assigned_technician_id
                else None
            ),

            assigned_technician_name=(
                entity._assigned_technician_name
                if hasattr(entity, '_assigned_technician_name')
                else None
            ),

            created_by=(
                str(entity._created_by)
                if hasattr(entity, '_created_by') and entity._created_by
                else None
            ),

            resolution_notes=entity._resolution_notes if hasattr(entity, '_resolution_notes') else None,

            ar_session_log_json=ar_logs_str,

            created_at=entity.created_at,

            started_at=entity._started_at if hasattr(entity, '_started_at') else None,

            resolved_at=entity._resolved_at if hasattr(entity, '_resolved_at') else None,

            closed_at=entity._closed_at if hasattr(entity, '_closed_at') else None,

            updated_at=entity.updated_at,
        )

    def list_by_technician(
        self,
        technician_id: str
    ) -> List[MaintenanceTicket]:

        session = self._get_session()

        try:
            models = (
                session.query(MaintenanceTicketModel)
                .filter(
                    MaintenanceTicketModel.assigned_technician_id
                    == str(technician_id)
                )
                .all()
            )

            return [
                self._to_domain(model)
                for model in models
            ]

        finally:
            session.close()

    def list_by_status(
        self,
        status: str
    ) -> List[MaintenanceTicket]:

        session = self._get_session()

        try:
            models = (
                session.query(MaintenanceTicketModel)
                .filter(
                    MaintenanceTicketModel.status
                    == status.upper()
                )
                .all()
            )

            return [
                self._to_domain(model)
                for model in models
            ]

        finally:
            session.close()