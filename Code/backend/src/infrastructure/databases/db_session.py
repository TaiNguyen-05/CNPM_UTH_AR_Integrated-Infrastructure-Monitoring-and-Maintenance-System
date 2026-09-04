import os
import json
from datetime import datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session

from infrastructure.databases.base import Base
from config import Config


# ============================================================
# DATABASE CONFIGURATION
# ============================================================
# Ưu tiên kết nối Supabase PostgreSQL.
# Nếu không có SUPABASE_DB_URL thì dùng các biến cũ.
# Cuối cùng fallback sang SQLite local.
DB_URL = (
    os.environ.get('SUPABASE_DB_URL')
    or os.environ.get('POSTGREE_DATABASE_URL')
    or os.environ.get('DATABASE_URI')
    or 'sqlite:///default.db'
)


# ============================================================
# DATABASE ENGINE
# ============================================================
# Thử kết nối PostgreSQL/Supabase trước.
# Nếu PostgreSQL không kết nối được thì fallback sang SQLite.
try:
    if DB_URL.startswith('postgresql'):

        test_engine = create_engine(
            DB_URL,
            connect_args={
                'connect_timeout': 3
            }
        )

        # Test connection
        with test_engine.connect():
            pass

        engine = test_engine

        print("[DB] PostgreSQL/Supabase connection successful!")

    else:

        engine = create_engine(
            DB_URL,
            connect_args={
                'check_same_thread': False
            } if 'sqlite' in DB_URL else {}
        )

        print("[DB] SQLite database connection successful!")

except Exception as e:

    print(
        f"[DB] Remote database unreachable, "
        f"falling back to local SQLite: {e}"
    )

    sqlite_path = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            '..',
            '..',
            'ar_imms.db'
        )
    )

    engine = create_engine(
        f"sqlite:///{sqlite_path}",
        connect_args={
            'check_same_thread': False
        }
    )

    print(f"[DB] Using local SQLite database: {sqlite_path}")


# ============================================================
# SESSION FACTORY
# ============================================================
SessionFactory = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

db_session = scoped_session(SessionFactory)


# ============================================================
# INITIALIZE AR-IMMS DATABASE
# ============================================================
def init_ar_database(app=None):
    """
    Khởi tạo tất cả các bảng và nạp dữ liệu mẫu ban đầu nếu rỗng.
    """

    from infrastructure.models.ar_models import (
        RackModel,
        ServerNodeModel,
        AlertModel,
        MaintenanceTicketModel,
        UserModel
    )

    # Tạo tất cả bảng
    Base.metadata.create_all(bind=engine)

    session = db_session()

    # ========================================================
    # SEED DATA
    # ========================================================
    try:

        if session.query(RackModel).count() == 0:

            print("[DB] Seeding initial AR-IMMS demo data...")

            # ====================================================
            # 1. SEED RACKS
            # ====================================================

            rack_a1 = RackModel(
                id='rack-a1',
                name='Rack A1 - Compute Cluster Alpha',
                code='RACK-A1',
                room_name='Server Room 01',
                total_u=42,
                power_limit_kw=12.5,
                x_coord=10.5,
                y_coord=24.0,
            )

            rack_a2 = RackModel(
                id='rack-a2',
                name='Rack A2 - Storage & Database Cluster',
                code='RACK-A2',
                room_name='Server Room 01',
                total_u=42,
                power_limit_kw=15.0,
                x_coord=12.0,
                y_coord=24.0,
            )

            rack_b1 = RackModel(
                id='rack-b1',
                name='Rack B1 - AI & GPU Acceleration Cluster',
                code='RACK-B1',
                room_name='Server Room 01',
                total_u=42,
                power_limit_kw=20.0,
                x_coord=14.0,
                y_coord=24.0,
            )

            session.add_all([
                rack_a1,
                rack_a2,
                rack_b1
            ])

            session.flush()

            # ====================================================
            # 2. SEED SERVER NODES
            # ====================================================

            node_01 = ServerNodeModel(
                id='SRV-NODE-01',
                rack_id='rack-a1',
                name='Primary Compute Node 01',
                u_start=38,
                u_height=2,
                ip_address='192.168.1.101',
                mac_address='52:54:00:8b:22:11',
                model='Dell PowerEdge R740 / Xeon Gold 6248R',
                cpu_model='Intel Xeon Gold 6248R @ 3.00GHz (24C/48T)',
                ram_total_gb=64,
                disk_total_gb=2000,
                qr_code_payload='ar-imms://node/SRV-NODE-01',
                status='HEALTHY',
                metrics_json=json.dumps({
                    "cpu": 48.2,
                    "ram": 62.5,
                    "disk": 38.0,
                    "temp": 41.5,
                    "netIn": 142.0,
                    "netOut": 320.0
                }),
                containers_json=json.dumps([
                    {
                        "name": "auth-gateway-svc",
                        "image": "ar-imms/auth:v1.2",
                        "cpu": "4.2%",
                        "ram": "512MB",
                        "status": "RUNNING"
                    },
                    {
                        "name": "telemetry-collector-agent",
                        "image": "ar-imms/collector:v2.0",
                        "cpu": "12.8%",
                        "ram": "1.2GB",
                        "status": "RUNNING"
                    },
                    {
                        "name": "ar-spatial-anchor-api",
                        "image": "ar-imms/spatial:latest",
                        "cpu": "1.5%",
                        "ram": "256MB",
                        "status": "RUNNING"
                    }
                ]),
            )

            node_02 = ServerNodeModel(
                id='SRV-NODE-02',
                rack_id='rack-a1',
                name='Secondary Compute Node 02',
                u_start=35,
                u_height=2,
                ip_address='192.168.1.102',
                mac_address='52:54:00:8b:22:12',
                model='Dell PowerEdge R740 / Xeon Gold 6248R',
                cpu_model='Intel Xeon Gold 6248R @ 3.00GHz (24C/48T)',
                ram_total_gb=64,
                disk_total_gb=2000,
                qr_code_payload='ar-imms://node/SRV-NODE-02',
                status='HEALTHY',
                metrics_json=json.dumps({
                    "cpu": 52.5,
                    "ram": 58.2,
                    "disk": 45.4,
                    "temp": 44.2,
                    "netIn": 290.0,
                    "netOut": 340.0
                }),
                containers_json=json.dumps([
                    {
                        "name": "ml-inference-engine",
                        "image": "ar-imms/ml-runner:v3.1",
                        "cpu": "18.4%",
                        "ram": "8GB",
                        "status": "RUNNING"
                    },
                    {
                        "name": "stream-processor",
                        "image": "ar-imms/kafka-worker:1.4",
                        "cpu": "16.1%",
                        "ram": "8GB",
                        "status": "RUNNING"
                    }
                ]),
            )

            node_03 = ServerNodeModel(
                id='SRV-NODE-03',
                rack_id='rack-a1',
                name='Database Primary Replica',
                u_start=30,
                u_height=4,
                ip_address='192.168.1.103',
                mac_address='52:54:00:8b:22:13',
                model='HPE ProLiant DL380 Gen10',
                cpu_model='AMD EPYC 7742 (64C/128T)',
                ram_total_gb=128,
                disk_total_gb=8000,
                qr_code_payload='ar-imms://node/SRV-NODE-03',
                status='HEALTHY',
                metrics_json=json.dumps({
                    "cpu": 45.0,
                    "ram": 54.0,
                    "disk": 52.5,
                    "temp": 46.0,
                    "netIn": 220.0,
                    "netOut": 380.0
                }),
                containers_json=json.dumps([
                    {
                        "name": "postgres-ha-master",
                        "image": "postgres:16-alpine",
                        "cpu": "35.0%",
                        "ram": "32GB",
                        "status": "RUNNING"
                    },
                    {
                        "name": "pg-bouncer-pooler",
                        "image": "pgbouncer:latest",
                        "cpu": "8.0%",
                        "ram": "2GB",
                        "status": "RUNNING"
                    }
                ]),
            )

            node_04 = ServerNodeModel(
                id='SRV-NODE-04',
                rack_id='rack-a2',
                name='Application Web Gateway',
                u_start=36,
                u_height=2,
                ip_address='192.168.1.104',
                mac_address='52:54:00:8b:22:14',
                model='Supermicro 1U TwinPro',
                cpu_model='AMD EPYC 7302P (16C/32T)',
                ram_total_gb=32,
                disk_total_gb=1000,
                qr_code_payload='ar-imms://node/SRV-NODE-04',
                status='HEALTHY',
                metrics_json=json.dumps({
                    "cpu": 32.0,
                    "ram": 44.0,
                    "disk": 41.0,
                    "temp": 39.0,
                    "netIn": 450.0,
                    "netOut": 620.0
                }),
                containers_json=json.dumps([
                    {
                        "name": "nginx-ingress",
                        "image": "ingress-nginx/controller:v1.9",
                        "cpu": "6.2%",
                        "ram": "512MB",
                        "status": "RUNNING"
                    },
                    {
                        "name": "api-gateway",
                        "image": "envoyproxy/envoy:v1.28",
                        "cpu": "8.4%",
                        "ram": "1GB",
                        "status": "RUNNING"
                    }
                ]),
            )

            node_05 = ServerNodeModel(
                id='SRV-NODE-05',
                rack_id='rack-a2',
                name='Log Aggregator & Pipeline',
                u_start=20,
                u_height=3,
                ip_address='192.168.1.105',
                mac_address='52:54:00:8b:22:15',
                model='Dell PowerEdge R640',
                cpu_model='Intel Xeon Bronze 3204',
                ram_total_gb=64,
                disk_total_gb=4000,
                qr_code_payload='ar-imms://node/SRV-NODE-05',
                status='HEALTHY',
                metrics_json=json.dumps({
                    "cpu": 41.5,
                    "ram": 63.0,
                    "disk": 58.0,
                    "temp": 45.0,
                    "netIn": 380.0,
                    "netOut": 210.0
                }),
                containers_json=json.dumps([
                    {
                        "name": "fluentbit-agent",
                        "image": "fluent/fluent-bit:2.2",
                        "cpu": "12.0%",
                        "ram": "2GB",
                        "status": "RUNNING"
                    },
                    {
                        "name": "loki-ingester",
                        "image": "grafana/loki:2.9",
                        "cpu": "15.5%",
                        "ram": "4GB",
                        "status": "RUNNING"
                    }
                ]),
            )

            node_06 = ServerNodeModel(
                id='SRV-NODE-06',
                rack_id='rack-b1',
                name='Deep Learning & Analytics Node',
                u_start=30,
                u_height=4,
                ip_address='192.168.1.106',
                mac_address='52:54:00:8b:22:16',
                model='Gigabyte GPU Chassis / 4x RTX 4090',
                cpu_model='AMD Threadripper PRO 5995WX',
                ram_total_gb=128,
                disk_total_gb=8000,
                qr_code_payload='ar-imms://node/SRV-NODE-06',
                status='HEALTHY',
                metrics_json=json.dumps({
                    "cpu": 58.0,
                    "ram": 76.0,
                    "disk": 65.0,
                    "temp": 58.0,
                    "netIn": 650.0,
                    "netOut": 800.0
                }),
                containers_json=json.dumps([
                    {
                        "name": "pytorch-training",
                        "image": "pytorch/pytorch:2.2-cuda12",
                        "cpu": "42.0%",
                        "ram": "64GB",
                        "status": "RUNNING"
                    },
                    {
                        "name": "triton-inference",
                        "image": "nvidia/tritonserver:24.01",
                        "cpu": "18.0%",
                        "ram": "16GB",
                        "status": "RUNNING"
                    }
                ]),
            )

            session.add_all([
                node_01,
                node_02,
                node_03,
                node_04,
                node_05,
                node_06
            ])

            session.flush()

            # ====================================================
            # 3. SEED ALERTS
            # ====================================================

            alert_01 = AlertModel(
                id='ALT-2026-1001',
                server_node_id='SRV-NODE-02',
                severity='CRITICAL',
                title='High CPU Thermal Limit Exceeded (79.2°C)',
                message=(
                    'Chassis Thermal Zone #1 sensor reported 79.2°C '
                    'exceeding critical threshold (75.0°C). '
                    'Possible cooling fan failure.'
                ),
                metric_name='temp',
                metric_value=79.2,
                threshold_value=75.0,
                status='OPEN',
            )

            alert_02 = AlertModel(
                id='ALT-2026-1002',
                server_node_id='SRV-NODE-03',
                severity='WARNING',
                title='Disk Storage Capacity Utilization > 80%',
                message=(
                    'NVMe storage volume /data1 reached '
                    '82.5% allocation capacity.'
                ),
                metric_name='disk',
                metric_value=82.5,
                threshold_value=80.0,
                status='ACKNOWLEDGED',
                acknowledged_by='USR-002',
                acknowledged_at=datetime.utcnow(),
            )

            session.add_all([
                alert_01,
                alert_02
            ])

            session.flush()

            # ====================================================
            # 4. SEED MAINTENANCE TICKETS
            # ====================================================

            ticket_01 = MaintenanceTicketModel(
                id='TCK-2026-001',
                server_node_id='SRV-NODE-02',
                alert_id='ALT-2026-1001',
                title='Inspect and Replace Cooling Fan Module #2',
                description=(
                    'Chassis cooling fan #2 failure causing high thermal '
                    'alarm (79.2°C). Technician needs to locate rack A1 '
                    'slot U35-U36 using AR mobile app and hot-swap '
                    'fan module.'
                ),
                priority='CRITICAL',
                status='IN_PROGRESS',
                assigned_technician_id='USR-003',
                assigned_technician_name='Nguyen Van B (Field Tech)',
                created_by='USR-002',
                resolution_notes=None,
                ar_session_log_json=json.dumps([
                    {
                        "timestamp": datetime.utcnow().isoformat(),
                        "action": "QR_SCANNED",
                        "details": {
                            "target": "SRV-NODE-02",
                            "confidence": 0.99
                        }
                    },
                    {
                        "timestamp": datetime.utcnow().isoformat(),
                        "action": "AR_HUD_OVERLAY",
                        "details": {
                            "slot": "U35-U36",
                            "component": "Fan Module 2"
                        }
                    }
                ]),
                started_at=datetime.utcnow(),
            )

            session.add(ticket_01)

            # ====================================================
            # 5. SEED USERS
            # ====================================================

            user_admin = UserModel(
                id='USR-001',
                email='admin@ar-imms.dc',
                full_name='System Administrator',
                role='ADMIN',
                status='APPROVED',
                avatar='AD',
                department='Core Engineering',
                approved_at=datetime.utcnow(),
            )

            user_op = UserModel(
                id='USR-002',
                email='operator@ar-imms.dc',
                full_name='System Operator',
                role='OPERATOR',
                status='APPROVED',
                avatar='OP',
                department='NOC / Monitoring',
                approved_at=datetime.utcnow(),
            )

            user_tech = UserModel(
                id='USR-003',
                email='tech.nguyenvanb@ar-imms.dc',
                full_name='Nguyen Van B',
                role='TECHNICIAN',
                status='PENDING_APPROVAL',
                avatar='NB',
                department='Field Operations',
            )

            session.add_all([
                user_admin,
                user_op,
                user_tech
            ])

            # ====================================================
            # COMMIT
            # ====================================================

            session.commit()

            print(
                "[DB] AR-IMMS database initialized "
                "with seed data successfully!"
            )

    except Exception as ex:

        session.rollback()

        print(
            f"[DB] Database initialization error: {ex}"
        )

    finally:

        session.close()