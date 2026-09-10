import os, sys, psycopg2, bcrypt
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv('Code/backend/src/.env')
db_url = os.environ.get('SUPABASE_DB_URL')
if not db_url:
    print('No DB_URL found!')
    sys.exit(1)

db_url = db_url.replace('postgresql+psycopg2://', 'postgresql://')

conn = psycopg2.connect(db_url)
cur = conn.cursor()

# Accounts to ensure exist with Password123! and 123456
test_accounts = [
    {
        "id": "ADM-0001",
        "email": "sjenkins@ar-imms.corp",
        "full_name": "Sarah Jenkins",
        "role": "ADMIN",
        "status": "APPROVED",
        "department": "Core Engineering & Management",
        "password": "Password123!"
    },
    {
        "id": "TECH-1001",
        "email": "tbui@ar-imms.corp",
        "full_name": "Trần Văn Bình",
        "role": "TECHNICIAN",
        "status": "APPROVED",
        "department": "Field Operations & AR Maintenance",
        "password": "Password123!"
    },
    {
        "id": "OPR-0001",
        "email": "operator@ar-imms.corp",
        "full_name": "Operator Demo",
        "role": "OPERATOR",
        "status": "APPROVED",
        "department": "NOC / Monitoring",
        "password": "Password123!"
    },
    {
        "id": "USR-001",
        "email": "admin@ar-imms.dc",
        "full_name": "System Administrator",
        "role": "ADMIN",
        "status": "APPROVED",
        "department": "Core Engineering",
        "password": "Password123!"
    },
    {
        "id": "USR-002",
        "email": "operator@ar-imms.dc",
        "full_name": "System Operator",
        "role": "OPERATOR",
        "status": "APPROVED",
        "department": "NOC / Monitoring",
        "password": "Password123!"
    },
    {
        "id": "USR-003",
        "email": "tech.nguyenvanb@ar-imms.dc",
        "full_name": "Nguyen Van B",
        "role": "TECHNICIAN",
        "status": "APPROVED",
        "department": "Field Operations",
        "password": "Password123!"
    }
]

print("=== SEEDING / UPDATING TEST USERS ===")
for acc in test_accounts:
    pwd_hash = bcrypt.hashpw(acc["password"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    # Check if user exists by email
    cur.execute("SELECT id FROM users WHERE email = %s;", (acc["email"],))
    row = cur.fetchone()
    if row:
        cur.execute("""
            UPDATE users
            SET password_hash = %s,
                status = %s,
                role = %s,
                full_name = %s,
                department = %s,
                updated_at = NOW()
            WHERE email = %s;
        """, (pwd_hash, acc["status"], acc["role"], acc["full_name"], acc["department"], acc["email"]))
        print(f"Updated user: {acc['email']} (Password: {acc['password']})")
    else:
        cur.execute("""
            INSERT INTO users (id, email, full_name, role, status, department, password_hash, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW());
        """, (acc["id"], acc["email"], acc["full_name"], acc["role"], acc["status"], acc["department"], pwd_hash))
        print(f"Inserted new user: {acc['email']} (Password: {acc['password']})")

conn.commit()
print("=== VERIFYING USERS IN DATABASE ===")
cur.execute("SELECT id, email, role, status, (password_hash IS NOT NULL) FROM users;")
for r in cur.fetchall():
    print(f"  {r[0]} | {r[1]} | {r[2]} | {r[3]} | HasPwd: {r[4]}")

conn.close()
