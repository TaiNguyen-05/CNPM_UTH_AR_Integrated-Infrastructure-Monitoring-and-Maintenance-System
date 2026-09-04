from sqlalchemy import text
from infrastructure.databases.db_session import db_session

print("Dang ket noi database...")

s = db_session()

tables = [
    "users",
    "server_nodes",
    "alerts",
    "maintenance_tickets"
]

print()
print("=== KIEM TRA DU LIEU ===")

for table in tables:
    result = s.execute(
        text(f"SELECT COUNT(*) FROM {table}")
    ).scalar()

    print(f"{table}: {result} rows")

s.close()

print()
print("=== HOAN THANH ===")