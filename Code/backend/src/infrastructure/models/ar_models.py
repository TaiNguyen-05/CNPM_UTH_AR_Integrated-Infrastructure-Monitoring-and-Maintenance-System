from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    DateTime,
    Text,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.dialects.postgresql import ENUM, JSONB
from sqlalchemy.orm import relationship

from infrastructure.databases.base import Base


# ============================================================
# ENUMS
# ============================================================

UserRoleEnum = ENUM(
    "ADMIN",
    "OPERATOR",
    "TECHNICIAN",
    name="user_role_enum",
    create_type=False
)

UserStatusEnum = ENUM(
    "PENDING_APPROVAL",
    "APPROVED",
    "LOCKED",
    "REJECTED",
    name="user_status_enum",
    create_type=False
)

NodeStatusEnum = ENUM(
    "HEALTHY",
    "WARNING",
    "CRITICAL",
    "OFFLINE",
    name="node_status_enum",
    create_type=False
)

AlertSeverityEnum = ENUM(
    "INFO",
    "WARNING",
    "CRITICAL",
    name="alert_severity_enum",
    create_type=False
)

AlertStatusEnum = ENUM(
    "OPEN",
    "ACKNOWLEDGED",
    "RESOLVED",
    "DISMISSED",
    name="alert_status_enum",
    create_type=False
)

TicketPriorityEnum = ENUM(
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
    name="ticket_priority_enum",
    create_type=False
)

TicketStatusEnum = ENUM(
    "CREATED",
    "ASSIGNED",
    "IN_PROGRESS",
    "PENDING_PARTS",
    "RESOLVED",
    "CLOSED",
    name="ticket_status_enum",
    create_type=False
)


# ============================================================
# RACK MODEL
# ============================================================

class RackModel(Base):
    __tablename__ = "racks"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True
    )

    room_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("rooms.id"),
        nullable=False
    )

    name = Column(
        String(255),
        nullable=False
    )

    code = Column(
        String(50),
        unique=True,
        nullable=False
    )

    u_height = Column(
        Integer,
        nullable=False
    )

    x_coord = Column(
        Float,
        nullable=True
    )

    y_coord = Column(
        Float,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False
    )

    nodes = relationship(
        "ServerNodeModel",
        back_populates="rack"
    )


# ============================================================
# SERVER NODE MODEL
# ============================================================

class ServerNodeModel(Base):
    __tablename__ = "server_nodes"

    id = Column(
        String(50),
        primary_key=True
    )

    rack_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("racks.id", ondelete="CASCADE"),
        nullable=False
    )

    name = Column(
        String(255),
        nullable=False
    )

    u_start = Column(
        Integer,
        nullable=False
    )

    u_height = Column(
        Integer,
        nullable=False
    )

    ip_address = Column(
        String(45),
        nullable=False
    )

    mac_address = Column(
        String(20),
        nullable=True
    )

    model = Column(
        String(255),
        nullable=True
    )

    cpu_model = Column(
        String(255),
        nullable=True
    )

    ram_total_gb = Column(
        Integer,
        nullable=True
    )

    disk_total_gb = Column(
        Integer,
        nullable=True
    )

    qr_code_payload = Column(
        String(255),
        nullable=False
    )

    status = Column(
        NodeStatusEnum,
        nullable=False
    )

    last_heartbeat_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False
    )

    rack = relationship(
        "RackModel",
        back_populates="nodes"
    )

    alerts = relationship(
        "AlertModel",
        back_populates="server_node"
    )

    tickets = relationship(
        "MaintenanceTicketModel",
        back_populates="server_node"
    )


# ============================================================
# ALERT MODEL
# ============================================================

class AlertModel(Base):
    __tablename__ = "alerts"

    id = Column(
        String(50),
        primary_key=True
    )

    server_node_id = Column(
        String(50),
        ForeignKey("server_nodes.id", ondelete="CASCADE"),
        nullable=False
    )

    severity = Column(
        AlertSeverityEnum,
        nullable=False
    )

    title = Column(
        String(255),
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    metric_name = Column(
        String(255),
        nullable=True
    )

    metric_value = Column(
        Float,
        nullable=True
    )

    threshold_value = Column(
        Float,
        nullable=True
    )

    status = Column(
        AlertStatusEnum,
        nullable=False
    )

    triggered_at = Column(
        DateTime(timezone=True),
        nullable=False
    )

    acknowledged_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    acknowledged_by = Column(
        PG_UUID(as_uuid=True),
        nullable=True
    )

    resolved_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    resolved_by = Column(
        PG_UUID(as_uuid=True),
        nullable=True
    )

    server_node = relationship(
        "ServerNodeModel",
        back_populates="alerts"
    )


# ============================================================
# MAINTENANCE TICKET MODEL
# ============================================================

class MaintenanceTicketModel(Base):
    __tablename__ = "maintenance_tickets"

    id = Column(
        String(50),
        primary_key=True
    )

    alert_id = Column(
        String(50),
        nullable=True
    )

    server_node_id = Column(
        String(50),
        ForeignKey("server_nodes.id", ondelete="CASCADE"),
        nullable=False
    )

    title = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    priority = Column(
        TicketPriorityEnum,
        nullable=False
    )

    status = Column(
        TicketStatusEnum,
        nullable=False
    )

    assigned_technician_id = Column(
        PG_UUID(as_uuid=True),
        nullable=True
    )

    created_by = Column(
        PG_UUID(as_uuid=True),
        nullable=True
    )

    resolution_notes = Column(
        Text,
        nullable=True
    )

    ar_session_log = Column(
        JSONB,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False
    )

    started_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    resolved_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    closed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    server_node = relationship(
        "ServerNodeModel",
        back_populates="tickets"
    )


# ============================================================
# USER MODEL
# ============================================================

class UserModel(Base):
    __tablename__ = "users"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    full_name = Column(
        String(255),
        nullable=False
    )

    role = Column(
        UserRoleEnum,
        nullable=False
    )

    status = Column(
        UserStatusEnum,
        nullable=False
    )

    avatar_url = Column(
        String(255),
        nullable=True
    )

    phone_number = Column(
        String(50),
        nullable=True
    )

    department = Column(
        String(100),
        nullable=True
    )

    approved_by = Column(
        PG_UUID(as_uuid=True),
        nullable=True
    )

    approved_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    last_login_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False
    )