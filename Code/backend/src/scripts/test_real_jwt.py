import sys
import os
import requests

# ============================================================
# THÊM THƯ MỤC SRC VÀO PYTHON PATH
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

EMAIL = "admin@ar-imms.dc"

BASE_URL = "http://127.0.0.1:9999"

ADMIN_ID = "11111111-1111-1111-1111-111111111111"


# ============================================================
# START TEST
# ============================================================

print("========================================")
print("       REAL JWT + JWT GUARD TEST")
print("========================================")


# ============================================================
# 1. LOGIN
# ============================================================

print()
print("[1] LOGIN")
print("----------------------------------------")

repo = UserRepository()
auth_service = AuthService(repo)

try:

    result = auth_service.login(
        EMAIL,
        "Admin@123456"
    )

    token = result["access_token"]

    print("Login: PASS")
    print("Token type:", result["token_type"])
    print("Expires:", result["expires_in"])
    print("Role:", result["user"]["role"])
    print("Status:", result["user"]["status"])

except Exception as e:

    print("Login: FAIL")
    print("Error:", str(e))

    sys.exit(1)


# ============================================================
# 2. DECODE JWT LOCAL
# ============================================================

print()
print("[2] DECODE JWT LOCAL")
print("----------------------------------------")

try:

    payload = auth_service.decode_access_token(token)

    print("Decode: PASS")
    print("sub:", payload.get("sub"))
    print("email:", payload.get("email"))
    print("role:", payload.get("role"))
    print("status:", payload.get("status"))

except Exception as e:

    print("Decode: FAIL")
    print("Error:", str(e))

    sys.exit(1)


# ============================================================
# 3. CALL PROTECTED API
# ============================================================

print()
print("[3] CALL PROTECTED API")
print("----------------------------------------")

# Authorization + Content-Type
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Endpoint được bảo vệ bởi jwt_required
url = (
    BASE_URL
    + "/api/users/"
    + ADMIN_ID
    + "/approve"
)

try:

    response = requests.post(
        url,
        headers=headers,
        json={},
        timeout=10
    )

    print("URL:", url)
    print("HTTP Status:", response.status_code)

    try:
        print("Response:", response.json())

    except Exception:
        print("Response:", response.text)


    # ========================================================
    # KIỂM TRA JWT GUARD
    # ========================================================

    if response.status_code == 401:

        print()
        print("JWT GUARD: FAIL")
        print("API trả về HTTP 401.")

    else:

        print()
        print("JWT GUARD: PASS")
        print("JWT đã vượt qua Authentication Guard.")


except requests.exceptions.ConnectionError:

    print()
    print("Không kết nối được server.")
    print("Hãy chắc chắn Terminal 1 đang chạy app.py")


except requests.exceptions.Timeout:

    print()
    print("Request timeout.")
    print("Server không phản hồi trong 10 giây.")


except Exception as e:

    print()
    print("API TEST ERROR")
    print("Error:", str(e))


# ============================================================
# FINISHED
# ============================================================

print()
print("========================================")
print("             TEST FINISHED")
print("========================================")