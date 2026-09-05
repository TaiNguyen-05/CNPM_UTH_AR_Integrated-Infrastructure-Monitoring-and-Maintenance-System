import os
import sys
from pathlib import Path
from getpass import getpass

import bcrypt
import psycopg2
from dotenv import load_dotenv


# ========================================
# LOAD .ENV
# ========================================

SRC_DIR = Path(__file__).resolve().parents[1]

if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

load_dotenv(SRC_DIR / ".env", override=True)

DB_URL = os.environ.get("SUPABASE_DB_URL")

if not DB_URL:
    raise RuntimeError(
        "Không tìm thấy SUPABASE_DB_URL trong file .env"
    )


USERS = [
    "admin@ar-imms.dc",
    "operator@ar-imms.dc",
    "technician@ar-imms.dc",
]


print("=" * 60)
print("       RESET TEST USER PASSWORDS")
print("=" * 60)

conn = psycopg2.connect(DB_URL)

try:
    cursor = conn.cursor()

    for email in USERS:

        print("\n" + "-" * 60)
        print(f"User: {email}")

        password = getpass("Nhap password moi: ")
        confirm = getpass("Nhap lai password: ")

        if password != confirm:
            print("SKIP: Hai password không giống nhau.")
            continue

        if len(password) < 8:
            print("SKIP: Password phải ít nhất 8 ký tự.")
            continue

        password_hash = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        cursor.execute(
            """
            UPDATE users
            SET password_hash = %s,
                updated_at = NOW()
            WHERE email = %s
            """,
            (password_hash, email)
        )

        if cursor.rowcount == 0:
            print("FAIL: Không tìm thấy user.")
        else:
            print("PASS: Password đã được cập nhật.")

    conn.commit()

    print("\n" + "=" * 60)
    print("RESET PASSWORD HOÀN TẤT")
    print("=" * 60)

finally:
    conn.close()