from sqlalchemy import text
from infrastructure.databases.db_session import db_session

print("Dang ket noi database...")

s = db_session()

rows = s.execute(
    text("""
        SELECT
            table_name,
            column_name,
            data_type,
            is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name IN (
              'users',
              'server_nodes',
              'alerts',
              'maintenance_tickets'
          )
        ORDER BY table_name, ordinal_position
    """)
).fetchall()

print()
print("=== CAU TRUC 4 BANG ===")

current_table = None

for row in rows:
    table_name, column_name, data_type, nullable = row

    if table_name != current_table:
        print()
        print(f"[{table_name}]")
        current_table = table_name

    print(
        f"  - {column_name} | "
        f"type={data_type} | "
        f"nullable={nullable}"
    )

s.close()

print()
print("=== HOAN THANH ===")