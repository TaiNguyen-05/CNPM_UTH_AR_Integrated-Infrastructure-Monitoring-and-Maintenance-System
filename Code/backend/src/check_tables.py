from sqlalchemy import text
from infrastructure.databases.db_session import db_session

print("Dang ket noi database...")

s = db_session()

rows = s.execute(
    text("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
).fetchall()

print()
print("=== CAC TABLE TRONG SUPABASE ===")

for row in rows:
    print("-", row[0])

s.close()

print()
print("=== HOAN THANH ===")