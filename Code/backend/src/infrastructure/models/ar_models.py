from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    DateTime,
    Text,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from infrastructure.databases.base import Base


# ============================================================
# RACK MODEL
# ============================================================

class RackModel(Base):
    __tablename__ = "racks"

    id = Column(
        String(50),
        primary_key=True
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

    room_name = Column(
        String(100),
        nullable=True
    )

    total_u = Column(
        Integer,
        nullable=True,
        default=42
    )

    power_limit_kw = Column(
        Float,
        nullable=True
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
        DateTime,
        nullable=True
    )

    updated_at = Column(
        DateTime,
        nullable=True
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
        String(50),
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
        nullable=True,
        default=1
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
        String(50),
        nullable=True,
        default="HEALTHY"
    )

    metrics_json = Column(
        Text,
        nullable=True
    )

    containers_json = Column(
        Text,
        nullable=True
    )

    last_heartbeat_at = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        nullable=True
    )

    updated_at = Column(
        DateTime,
        nullable=True
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
        String(50),
        nullable=True,
        default="INFO"
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
        String(100),
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
        String(50),
        nullable=True,
        default="OPEN"
    )

    acknowledged_by = Column(
        String(50),
        nullable=True
    )

    acknowledged_at = Column(
        DateTime,
        nullable=True
    )

    resolved_by = Column(
        String(50),
        nullable=True
    )

    resolved_at = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        nullable=True
    )

    updated_at = Column(
        DateTime,
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

    server_node_id = Column(
        String(50),
        ForeignKey("server_nodes.id", ondelete="CASCADE"),
        nullable=False
    )

    alert_id = Column(
        String(50),
        nullable=True
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
        String(50),
        nullable=True,
        default="MEDIUM"
    )

    status = Column(
        String(50),
        nullable=True,
        default="CREATED"
    )

    assigned_technician_id = Column(
        String(50),
        nullable=True
    )

    assigned_technician_name = Column(
        String(255),
        nullable=True
    )

    created_by = Column(
        String(50),
        nullable=True
    )

    resolution_notes = Column(
        Text,
        nullable=True
    )

    ar_session_log_json = Column(
        Text,
        nullable=True
    )

    started_at = Column(
        DateTime,
        nullable=True
    )

    resolved_at = Column(
        DateTime,
        nullable=True
    )

    closed_at = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        nullable=True
    )

    updated_at = Column(
        DateTime,
        nullable=True
    )

    server_node = relationship(
        "ServerNodeModel",
        back_populates="tickets"
    )


# ============================================================
# METRIC LOG MODEL (TIME-SERIES)
# ============================================================

class MetricLogModel(Base):
    __tablename__ = "metrics"

    id = Column(
        String(50),
        primary_key=True
    )

    server_node_id = Column(
        String(50),
        ForeignKey("server_nodes.id", ondelete="CASCADE"),
        nullable=False
    )

    cpu = Column(
        Float,
        nullable=True
    )

    ram = Column(
        Float,
        nullable=True
    )

    disk = Column(
        Float,
        nullable=True
    )

    temp = Column(
        Float,
        nullable=True
    )

    network_in_kbps = Column(
        Float,
        nullable=True
    )

    network_out_kbps = Column(
        Float,
        nullable=True
    )

    timestamp = Column(
        DateTime,
        nullable=False
    )


# ============================================================
# USER MODEL
# ============================================================

class UserModel(Base):
    __tablename__ = "users"

    id = Column(
        String(50),
        primary_key=True
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=True
    )

    full_name = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(50),
        nullable=True,
        default="VIEWER"
    )

    status = Column(
        String(50),
        nullable=True,
        default="PENDING_APPROVAL"
    )

    avatar = Column(
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
        String(50),
        nullable=True
    )

    approved_at = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        nullable=True
    )

    updated_at = Column(
        DateTime,
        nullable=True
    )