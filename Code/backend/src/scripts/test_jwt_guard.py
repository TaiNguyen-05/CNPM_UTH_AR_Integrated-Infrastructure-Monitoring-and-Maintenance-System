import sys
import os
import requests

# ============================================================
# THÊM SRC VÀO PYTHON PATH
# ============================================================

SRC_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)


# ============================================================
# IMPORT
# ============================================================

from services.auth_service import AuthService
from infrastructure.repositories.user_repository import UserRepository


# ============================================================
# CONFIG
# ============================================================

BASE_URL = "http://127.0.0.1:9999"
ADMIN_ID = "11111111-1111-1111-1111-111111111111"

EMAIL = "admin@ar-imms.dc"

PASSWORD = "Admin@123456"

API_URL = (
    BASE_URL
    + "/api/users/"
    + ADMIN_ID
    + "/approve"
)


# ============================================================
# HELPER
# ============================================================

def print_result(test_name, passed, detail):

    print()
    print("----------------------------------------")
    print(test_name)

    if passed:
        print("RESULT: PASS")
    else:
        print("RESULT: FAIL")

    print("Detail:", detail)


# ============================================================
# START
# ============================================================

print("========================================")
print("          JWT GUARD SECURITY TEST")
print("========================================")


# ============================================================
# KIỂM TRA SERVER
# ============================================================

print()
print("[0] SERVER CHECK")
print("----------------------------------------")

try:

    response = requests.get(
        BASE_URL + "/api/health",
        timeout=5
    )

    print("Server HTTP Status:", response.status_code)

except Exception as e:

    print("Không kết nối được server.")
    print("Hãy chạy app.py trước.")
    print("Error:", str(e))

    sys.exit(1)


# ============================================================
# TEST 1 - KHÔNG CÓ TOKEN
# ============================================================

print()
print("[1] NO JWT TOKEN")
print("----------------------------------------")

try:

    response = requests.post(
        API_URL,
        headers={
            "Content-Type": "application/json"
        },
        json={},
        timeout=10
    )

    print("HTTP Status:", response.status_code)

    try:
        print("Response:", response.json())
    except Exception:
        print("Response:", response.text)

    if response.status_code == 401:

        print_result(
            "TEST 1 - NO JWT",
            True,
            "Server từ chối request không có Authorization."
        )

    else:

        print_result(
            "TEST 1 - NO JWT",
            False,
            "Request không trả về HTTP 401."
        )

except Exception as e:

    print_result(
        "TEST 1 - NO JWT",
        False,
        str(e)
    )


# ============================================================
# TEST 2 - JWT GIẢ
# ============================================================

print()
print("[2] INVALID JWT TOKEN")
print("----------------------------------------")

fake_token = "this-is-an-invalid-jwt-token"

try:

    response = requests.post(
        API_URL,
        headers={
            "Authorization": f"Bearer {fake_token}",
            "Content-Type": "application/json"
        },
        json={},
        timeout=10
    )

    print("HTTP Status:", response.status_code)

    try:
        print("Response:", response.json())
    except Exception:
        print("Response:", response.text)

    if response.status_code == 401:

        print_result(
            "TEST 2 - INVALID JWT",
            True,
            "Server từ chối JWT không hợp lệ."
        )

    else:

        print_result(
            "TEST 2 - INVALID JWT",
            False,
            "JWT giả không bị từ chối bằng HTTP 401."
        )

except Exception as e:

    print_result(
        "TEST 2 - INVALID JWT",
        False,
        str(e)
    )


# ============================================================
# TẠO JWT THẬT
# ============================================================

print()
print("[3] CREATE REAL JWT")
print("----------------------------------------")

try:

    repo = UserRepository()

    auth_service = AuthService(repo)

    result = auth_service.login(
        EMAIL,
        PASSWORD
    )

    token = result["access_token"]

    print("Login: PASS")
    print("Role:", result["user"]["role"])
    print("Status:", result["user"]["status"])

except Exception as e:

    print("Login: FAIL")
    print("Error:", str(e))

    sys.exit(1)


# ============================================================
# TEST 3 - JWT THẬT
# ============================================================

print()
print("[4] VALID JWT TOKEN")
print("----------------------------------------")

try:

    response = requests.post(
        API_URL,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json={},
        timeout=10
    )

    print("HTTP Status:", response.status_code)

    try:
        print("Response:", response.json())
    except Exception:
        print("Response:", response.text)

    if response.status_code != 401:

        print_result(
            "TEST 3 - VALID JWT",
            True,
            "JWT hợp lệ đã vượt qua JWT Guard."
        )

    else:

        print_result(
            "TEST 3 - VALID JWT",
            False,
            "JWT hợp lệ vẫn bị HTTP 401."
        )

except Exception as e:

    print_result(
        "TEST 3 - VALID JWT",
        False,
        str(e)
    )


# ============================================================
# FINISH
# ============================================================

print()
print("========================================")
print("             TEST SUMMARY")
print("========================================")

print()
print("JWT Guard Security Test hoàn tất.")
print()
print("Mục tiêu:")
print("1. Không có token  -> 401")
print("2. JWT giả         -> 401")
print("3. JWT thật        -> vượt qua Guard")
print()
print("========================================")