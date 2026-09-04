import json
from typing import List, Optional
from uuid import UUID

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

        return ServerNode(
            id=str(model.id),
            rack_id=str(model.rack_id),
            name=model.name,
            u_start=model.u_start,
            u_height=model.u_height,
            ip_address=model.ip_address,
            mac_address=model.mac_address,
            model=model.model,
            cpu_model=model.cpu_model,
            ram_total_gb=model.ram_total_gb or 32,
            disk_total_gb=model.disk_total_gb or 1000,
            qr_code_payload=model.qr_code_payload,
            status=str(model.status),
            metrics=None,
            containers=None,
            last_heartbeat_at=model.last_heartbeat_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(
        self,
        entity: ServerNode
    ) -> ServerNodeModel:

        return ServerNodeModel(
            id=entity.id,
            rack_id=UUID(str(entity.rack_id)),
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
            last_heartbeat_at=entity._last_heartbeat_at,
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
                    ServerNodeModel.rack_id == UUID(str(rack_id))
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
    """
    Repository cho Rack.

    Lưu ý:
    Database racks hiện tại có 8 cột:
        id
        room_id
        name
        code
        u_height
        x_coord
        y_coord
        created_at

    Không có:
        room_name
        total_u
        power_limit_kw
        updated_at
    """

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

            # Domain Rack cũ vẫn yêu cầu room_name.
            # Database hiện tại lưu room_id nên tạm thời
            # không lấy room_name trực tiếp từ RackModel.
            room_name="Server Room 01",

            # Domain cũ dùng total_u.
            # Schema mới dùng u_height.
            total_u=model.u_height,

            # Database hiện tại không có power_limit_kw.
            power_limit_kw=10.0,

            x_coord=model.x_coord or 0.0,
            y_coord=model.y_coord or 0.0,

            created_at=model.created_at,
            updated_at=model.created_at,
        )

    def _to_model(
        self,
        entity: Rack
    ) -> RackModel:

        """
        Chuyển Domain Rack -> Database Model.

        Database yêu cầu room_id nhưng Domain Rack hiện tại
        chưa có room_id.

        Vì vậy phần WRITE Rack sẽ được hoàn thiện sau khi
        Domain Rack được đồng bộ với schema mới.
        """

        raise NotImplementedError(
            "Rack WRITE chưa được bật: "
            "Domain Rack cần bổ sung room_id để khớp database."
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
            severity=str(model.severity),
            metric_name=model.metric_name,
            metric_value=model.metric_value,
            threshold_value=model.threshold_value,
            status=str(model.status),

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

            # Database dùng triggered_at.
            # Domain dùng created_at / updated_at.
            created_at=model.triggered_at,
            updated_at=model.triggered_at,
        )

    def _to_model(
        self,
        entity: Alert
    ) -> AlertModel:

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

            acknowledged_by=(
                UUID(str(entity._acknowledged_by))
                if entity._acknowledged_by
                else None
            ),

            acknowledged_at=entity._acknowledged_at,

            resolved_by=(
                UUID(str(entity._resolved_by))
                if entity._resolved_by
                else None
            ),

            resolved_at=entity._resolved_at,

            triggered_at=entity.created_at,
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
                    AlertModel.server_node_id == node_id
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

        return MaintenanceTicket(
            id=str(model.id),
            server_node_id=str(model.server_node_id),

            title=model.title,
            description=model.description or "",

            priority=str(model.priority),
            status=str(model.status),

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

            # Database không có assigned_technician_name
            assigned_technician_name=None,

            created_by=(
                str(model.created_by)
                if model.created_by
                else None
            ),

            resolution_notes=model.resolution_notes,

            # Database dùng ar_session_log JSONB
            ar_session_logs=model.ar_session_log or [],

            created_at=model.created_at,
            started_at=model.started_at,
            resolved_at=model.resolved_at,
            closed_at=model.closed_at,

            # Database không có updated_at
            updated_at=model.created_at,
        )

    def _to_model(
        self,
        entity: MaintenanceTicket
    ) -> MaintenanceTicketModel:

        return MaintenanceTicketModel(
            id=entity.id,

            server_node_id=entity.server_node_id,

            alert_id=entity._alert_id,

            title=entity.title,

            description=entity._description,

            priority=entity.priority,

            status=entity.status,

            assigned_technician_id=(
                UUID(str(entity._assigned_technician_id))
                if entity._assigned_technician_id
                else None
            ),

            created_by=(
                UUID(str(entity._created_by))
                if entity._created_by
                else None
            ),

            resolution_notes=entity._resolution_notes,

            ar_session_log=entity._ar_session_logs,

            created_at=entity.created_at,

            started_at=entity._started_at,

            resolved_at=entity._resolved_at,

            closed_at=entity._closed_at,
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
                    == UUID(str(technician_id))
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


# ============================================================
# USER REPOSITORY
# ============================================================

class UserRepository(
    BaseRepository[UserAccount, UserModel],
    IUserRepository
):
    """Repository cho UserAccount."""

    def __init__(self):
        super().__init__(UserModel)

    def _to_domain(
        self,
        model: UserModel
    ) -> Optional[UserAccount]:

        if not model:
            return None

        return UserAccount(
            id=str(model.id),
            email=model.email,
            full_name=model.full_name,
            role=str(model.role),
            status=str(model.status),

            phone_number=model.phone_number,
            department=model.department,

            avatar=model.avatar_url,

            password_hash=model.password_hash,

            approved_by=(
                str(model.approved_by)
                if model.approved_by
                else None
            ),

            approved_at=model.approved_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(
        self,
        entity: UserAccount
    ) -> UserModel:

        return UserModel(
            id=UUID(str(entity.id)),
            email=entity.email,
            password_hash=entity._password_hash or "",
            full_name=entity.full_name,

            role=entity.role,
            status=entity.status,

            avatar_url=entity._avatar,
            phone_number=entity._phone_number,
            department=entity._department,

            approved_by=(
                UUID(str(entity._approved_by))
                if entity._approved_by
                else None
            ),

            approved_at=entity._approved_at,
        )

    def get_by_email(
        self,
        email: str
    ) -> Optional[UserAccount]:

        session = self._get_session()

        try:
            model = (
                session.query(UserModel)
                .filter(
                    UserModel.email
                    == email.strip().lower()
                )
                .first()
            )

            return self._to_domain(model) if model else None

        finally:
            session.close()

    def list_pending(self) -> List[UserAccount]:

        session = self._get_session()

        try:
            models = (
                session.query(UserModel)
                .filter(
                    UserModel.status
                    == "PENDING_APPROVAL"
                )
                .all()
            )

            return [
                self._to_domain(model)
                for model in models
            ]

        finally:
            session.close()