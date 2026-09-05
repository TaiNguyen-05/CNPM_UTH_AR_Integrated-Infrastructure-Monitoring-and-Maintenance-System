import sys
import os
from datetime import datetime, timedelta, timezone

import jwt
import requests


# ============================================================
# ADD SRC TO PYTHON PATH
# ============================================================

SRC_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)


# ============================================================
# IMPORT AUTH SERVICE
# ============================================================

from services.auth_service import AuthService
from infrastructure.repositories.user_repository import UserRepository


# ============================================================
# CONFIG
# ============================================================

BASE_URL = "http://127.0.0.1:9999"

TEST_USER_ID = (
    "11111111-1111-1111-1111-111111111111"
)

ENDPOINT = (
    f"{BASE_URL}/api/users/"
    f"{TEST_USER_ID}/approve"
)


# ============================================================
# LOGIN INFORMATION
# ============================================================

EMAIL = "admin@ar-imms.dc"

# ============================================================
# ĐIỀN PASSWORD ADMIN CỦA BẠN VÀO ĐÂY
# Không gửi password cho mình.
# ============================================================

PASSWORD = "duongthanhlam28112007"


# ============================================================
# LOGIN
# ============================================================

def login_admin():

    try:

        auth_service = AuthService(
            UserRepository()
        )

        result = auth_service.login(
            EMAIL,
            PASSWORD
        )

        return result

    except Exception as e:

        print(
            f"LOGIN ERROR: {e}"
        )

        return None


# ============================================================
# CREATE EXPIRED JWT
# ============================================================

def create_expired_token(user):

    auth_service = AuthService(
        UserRepository()
    )

    now = datetime.now(timezone.utc)

    # Token đã hết hạn 10 phút
    expired_time = now - timedelta(
        minutes=10
    )

    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "status": user.status,
        "iat": expired_time - timedelta(minutes=1),
        "exp": expired_time
    }

    token = jwt.encode(
        payload,
        auth_service.secret_key,
        algorithm="HS256"
    )

    return token


# ============================================================
# MAIN TEST
# ============================================================

print("=" * 60)

print(
    "             EXPIRED JWT TEST"
)

print("=" * 60)


# ============================================================
# STEP 1 - LOGIN
# ============================================================

print("\n[1] LOGIN ADMIN")

login_result = login_admin()

if not login_result:

    print(
        "LOGIN: FAIL"
    )

    print(
        "\nTEST RESULT: FAIL"
    )

    sys.exit(1)


user_info = login_result["user"]

print(
    "LOGIN: PASS"
)

print(
    f"Role: {user_info.get('role')}"
)

print(
    f"Status: {user_info.get('status')}"
)


# ============================================================
# GET USER OBJECT
# ============================================================

repository = UserRepository()

user = repository.get_by_email(
    EMAIL
)

if not user:

    print(
        "Không tìm thấy user trong database."
    )

    sys.exit(1)


# ============================================================
# STEP 2 - CREATE EXPIRED TOKEN
# ============================================================

print("\n[2] CREATE EXPIRED JWT")

expired_token = create_expired_token(
    user
)

print(
    "Expired JWT: CREATED"
)

print(
    "Token expiration: 10 phút trước"
)


# ============================================================
# STEP 3 - CALL PROTECTED ENDPOINT
# ============================================================

print(
    "\n[3] CALL PROTECTED ENDPOINT"
)

headers = {
    "Authorization": f"Bearer {expired_token}",
    "Content-Type": "application/json"
}


try:

    response = requests.post(
        ENDPOINT,
        headers=headers,
        json={}
    )

    print(
        f"HTTP Status: {response.status_code}"
    )

    try:

        data = response.json()

        print(
            f"Response: {data}"
        )

    except Exception:

        print(
            f"Response: {response.text}"
        )


    # ========================================================
    # EXPECTED RESULT
    # ========================================================

    if response.status_code == 401:

        print(
            "\nRESULT: PASS"
        )

        print(
            "JWT hết hạn đã bị từ chối đúng."
        )

        print(
            "Expected: HTTP 401"
        )

        print(
            f"Received: HTTP {response.status_code}"
        )

    else:

        print(
            "\nRESULT: FAIL"
        )

        print(
            "JWT hết hạn chưa bị từ chối đúng."
        )

        print(
            "Expected: HTTP 401"
        )

        print(
            f"Received: HTTP {response.status_code}"
        )


except Exception as e:

    print(
        "\nREQUEST ERROR:"
    )

    print(e)

    print(
        "\nRESULT: FAIL"
    )