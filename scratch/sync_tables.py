import sys
import os
sys.path.insert(0, os.path.abspath("Code/backend/src"))

import psycopg2
from infrastructure.databases.base import Base
from infrastructure.databases.db_session import engine, db_session, init_ar_database
from infrastructure.models.ar_models import RackModel, ServerNodeModel, AlertModel, MaintenanceTicketModel, UserModel

pooler_uri = "postgresql://postgres.anthsojdjibgcsgxkkdu:CNPMUTH123%40@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require"

print("Resetting public schema on Supabase...")
conn = psycopg2.connect(pooler_uri)
conn.autocommit = True
cur = conn.cursor()
cur.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;")
conn.close()

print("Creating all tables via SQLAlchemy...")
Base.metadata.create_all(bind=engine)

print("Seeding initial database...")
init_ar_database()

session = db_session()
racks = session.query(RackModel).all()
nodes = session.query(ServerNodeModel).all()
alerts = session.query(AlertModel).all()
users = session.query(UserModel).all()

print(f"SUCCESS: Supabase Cloud Database is 100% READY!")
print(f"Stats: {len(racks)} Racks, {len(nodes)} Server Nodes, {len(alerts)} Alerts, {len(users)} Users.")
for n in nodes:
    print(f" - [{n.id}] {n.name} ({n.model}) [Rack: {n.rack_id}] QR: {n.qr_code_payload}")
