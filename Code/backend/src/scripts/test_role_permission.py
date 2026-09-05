import sys
import os
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
# IMPORT AUTH
# ============================================================

from services.auth_service import AuthService
from infrastructure.repositories.user_repository import UserRepository


# ============================================================
# SERVER
# ============================================================

BASE_URL = "http://127.0.0.1:9999"


# ============================================================
# USERS
# ============================================================

USERS = [
    {
        "name": "ADMIN",
        "email": "admin@ar-imms.dc",

        # ĐIỀN PASSWORD ADMIN CỦA BẠN
        "password": "duongthanhlam28112007",

        "expected_status": 200
    },

    {
        "name": "OPERATOR",
        "email": "operator@ar-imms.dc",

        # ĐIỀN PASSWORD OPERATOR CỦA BẠN
        "password": "duongthanhlam28112007",

        "expected_status": 403
    },

    {
        "name": "TECHNICIAN",
        "email": "technician@ar-imms.dc",

        # ĐIỀN PASSWORD TECHNICIAN CỦA BẠN
        "password": "duongthanhlam28112007",

        "expected_status": 403
    }
]


# ============================================================
# TEST USER ID
# ============================================================

TEST_USER_ID = (
    "11111111-1111-1111-1111-111111111111"
)


# ============================================================
# PROTECTED ENDPOINT
# ============================================================

ENDPOINT = (
    f"{BASE_URL}/api/users/"
    f"{TEST_USER_ID}/approve"
)


# ============================================================
# LOGIN
# ============================================================

def login_user(email, password):

    try:

        auth_service = AuthService(
            UserRepository()
        )

        result = auth_service.login(
            email,
            password
        )

        return result

    except Exception as e:

        print(
            f"Login ERROR: {e}"
        )

        return None


# ============================================================
# TEST ROLE
# ============================================================

def test_role(user):

    print("\n")
    print("=" * 60)
    print(
        f"TEST ROLE: {user['name']}"
    )
    print("=" * 60)

    print(
        f"Email: {user['email']}"
    )

    # --------------------------------------------------------
    # LOGIN
    # --------------------------------------------------------

    result = login_user(
        user["email"],
        user["password"]
    )

    if not result:

        print(
            "LOGIN: FAIL"
        )

        return False

    # --------------------------------------------------------
    # GET TOKEN
    # --------------------------------------------------------

    token = result["access_token"]

    user_info = result["user"]

    role = user_info.get("role")

    status = user_info.get("status")

    print(
        "LOGIN: PASS"
    )

    print(
        f"Role: {role}"
    )

    print(
        f"Status: {status}"
    )

    # --------------------------------------------------------
    # REQUEST
    # --------------------------------------------------------

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    try:

        response = requests.post(
            ENDPOINT,
            headers=headers,
            json={}
        )

        print("\nProtected Endpoint:")

        print(
            f"HTTP Status: "
            f"{response.status_code}"
        )

        try:

            data = response.json()

            print(
                f"Response: {data}"
            )

        except Exception:

            print(
                f"Response: "
                f"{response.text}"
            )

        # ----------------------------------------------------
        # CHECK RESULT
        # ----------------------------------------------------

        expected = user["expected_status"]

        if response.status_code == expected:

            print("\nRESULT: PASS")

            if role == "ADMIN":

                print(
                    "ADMIN được phép "
                    "truy cập endpoint."
                )

            else:

                print(
                    f"{role} bị từ chối "
                    "đúng quyền."
                )

            return True

        else:

            print("\nRESULT: FAIL")

            print(
                f"Expected HTTP "
                f"{expected}"
            )

            print(
                f"Received HTTP "
                f"{response.status_code}"
            )

            return False

    except Exception as e:

        print("\nREQUEST ERROR:")

        print(e)

        return False


# ============================================================
# MAIN TEST
# ============================================================

print("=" * 60)

print(
    "          ROLE PERMISSION TEST"
)

print("=" * 60)


passed = 0

total = 0


for user in USERS:

    total += 1

    result = test_role(user)

    if result:

        passed += 1


# ============================================================
# SUMMARY
# ============================================================

print("\n")

print("=" * 60)

print(
    "                TEST SUMMARY"
)

print("=" * 60)

print()

print(
    f"PASS: {passed}/{total}"
)

print(
    f"FAIL: {total - passed}/{total}"
)

print()

print("=" * 60)

print(
    "                 KẾT LUẬN"
)

print("=" * 60)

print()


if passed == total:

    print(
        "ROLE GUARD HOẠT ĐỘNG ĐÚNG."
    )

    print()

    print(
        "ADMIN       -> 200 PASS"
    )

    print(
        "OPERATOR    -> 403 PASS"
    )

    print(
        "TECHNICIAN  -> 403 PASS"
    )

else:

    print(
        "ROLE GUARD CHƯA ĐẠT."
    )