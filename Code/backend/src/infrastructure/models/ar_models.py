import json
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from infrastructure.databases.base import Base


class RackModel(Base):
    __tablename__ = 'racks'

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    room_name = Column(String(255), default='Server Room 01')
    total_u = Column(Integer, default=42)
    power_limit_kw = Column(Float, default=10.0)
    x_coord = Column(Float, default=0.0)
    y_coord = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    nodes = relationship('ServerNodeModel', back_populates='rack', cascade='all, delete-orphan')


class ServerNodeModel(Base):
    __tablename__ = 'server_nodes'

    id = Column(String(50), primary_key=True)  # e.g., 'SRV-NODE-01'
    rack_id = Column(String(50), ForeignKey('racks.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(255), nullable=False)
    u_start = Column(Integer, nullable=False)
    u_height = Column(Integer, default=2)
    ip_address = Column(String(45), nullable=False)
    mac_address = Column(String(20), nullable=True)
    model = Column(String(255), nullable=True)
    cpu_model = Column(String(255), nullable=True)
    ram_total_gb = Column(Integer, default=32)
    disk_total_gb = Column(Integer, default=1000)
    qr_code_payload = Column(String(255), unique=True, nullable=False)
    status = Column(String(20), default='HEALTHY')
    metrics_json = Column(Text, default='{}')
    containers_json = Column(Text, default='[]')
    last_heartbeat_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    rack = relationship('RackModel', back_populates='nodes')
    alerts = relationship('AlertModel', back_populates='server_node', cascade='all, delete-orphan')
    tickets = relationship('MaintenanceTicketModel', back_populates='server_node', cascade='all, delete-orphan')


class AlertModel(Base):
    __tablename__ = 'alerts'

    id = Column(String(50), primary_key=True)  # e.g., 'ALT-2026-1001'
    server_node_id = Column(String(50), ForeignKey('server_nodes.id', ondelete='CASCADE'), nullable=False)
    severity = Column(String(20), default='WARNING')  # INFO, WARNING, CRITICAL
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    metric_name = Column(String(50), default='cpu')
    metric_value = Column(Float, default=0.0)
    threshold_value = Column(Float, default=80.0)
    status = Column(String(20), default='OPEN')  # OPEN, ACKNOWLEDGED, RESOLVED, DISMISSED
    acknowledged_by = Column(String(50), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(50), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    server_node = relationship('ServerNodeModel', back_populates='alerts')


class MaintenanceTicketModel(Base):
    __tablename__ = 'maintenance_tickets'

    id = Column(String(50), primary_key=True)  # e.g., 'TCK-2026-001'
    server_node_id = Column(String(50), ForeignKey('server_nodes.id', ondelete='CASCADE'), nullable=False)
    alert_id = Column(String(50), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, default='')
    priority = Column(String(20), default='MEDIUM')  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(20), default='CREATED')   # CREATED, ASSIGNED, IN_PROGRESS, PENDING_PARTS, RESOLVED, CLOSED
    assigned_technician_id = Column(String(50), nullable=True)
    assigned_technician_name = Column(String(255), nullable=True)
    created_by = Column(String(50), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    ar_session_log_json = Column(Text, default='[]')
    started_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    server_node = relationship('ServerNodeModel', back_populates='tickets')


class UserModel(Base):
    __tablename__ = 'users'

    id = Column(String(50), primary_key=True)  # e.g., 'USR-001'
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(20), default='TECHNICIAN')  # ADMIN, OPERATOR, TECHNICIAN
    status = Column(String(20), default='PENDING_APPROVAL')  # PENDING_APPROVAL, APPROVED, LOCKED, REJECTED
    phone_number = Column(String(50), nullable=True)
    department = Column(String(100), default='Infrastructure Ops')
    avatar = Column(String(10), default='US')
    password_hash = Column(String(255), nullable=True)
    approved_by = Column(String(50), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
