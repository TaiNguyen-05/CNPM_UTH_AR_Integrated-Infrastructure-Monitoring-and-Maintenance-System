import os
from pathlib import Path
from getpass import getpass

import bcrypt
import psycopg2
from dotenv import load_dotenv

SRC_DIR = Path(__file__).resolve().parents[1]

load_dotenv(SRC_DIR / ".env", override=True)

DB_URL = os.environ.get("SUPABASE_DB_URL")

if not DB_URL:
    raise RuntimeError("Không tìm thấy SUPABASE_DB_URL")

email = "technician@ar-imms.dc"

password = getpass("Nhap password TECHNICIAN moi: ")
confirm = getpass("Nhap lai password: ")

if password != confirm:
    raise ValueError("Hai password khong giong nhau.")

if len(password) < 8:
    raise ValueError("Password phai co it nhat 8 ky tu.")

password_hash = bcrypt.hashpw(
    password.encode("utf-8"),
    bcrypt.gensalt()
).decode("utf-8")

conn = psycopg2.connect(DB_URL)

try:
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE users
        SET password_hash = %s,
            updated_at = NOW()
        WHERE email = %s
        """,
        (password_hash, email)
    )

    conn.commit()

    if cursor.rowcount == 1:
        print("PASS: TECHNICIAN password da duoc cap nhat.")
    else:
        print("FAIL: Khong tim thay TECHNICIAN.")

finally:
    conn.close()