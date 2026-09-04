import sys
import os
import requests

SRC_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from services.auth_service import AuthService
from infrastructure.repositories.user_repository import UserRepository


BASE_URL = "http://127.0.0.1:9999"
EMAIL = "admin@ar-imms.dc"
PASSWORD = "Admin@123456"
ADMIN_ID = "11111111-1111-1111-1111-111111111111"


print("========================================")
print("       TEST JWT GUARD - TEST 3")
print("========================================")


repo = UserRepository()
auth_service = AuthService(repo)

try:
    login_result = auth_service.login(
        EMAIL,
        PASSWORD
    )

    token = login_result["access_token"]

    print("Login: PASS")
    print("Role:", login_result["user"]["role"])
    print("Status:", login_result["user"]["status"])
    print("JWT created: PASS")

except Exception as e:
    print("Login: FAIL")
    print("Error:", str(e))
    sys.exit(1)


url = f"{BASE_URL}/api/users/{ADMIN_ID}/approve"

headers = {
    "Authorization": f"Bearer {token}"
}

print()
print("Calling API:")
print(url)
print("Authorization: Bearer <HIDDEN>")
print()

response = requests.post(
    url,
    headers=headers
)

print("Status Code:", response.status_code)
print("Response:", response.text)
print()

if response.status_code != 401:
    print("========================================")
    print("PASS: JWT hop le da vuot qua JWT Guard!")
    print("========================================")
else:
    print("========================================")
    print("FAIL: JWT van bi JWT Guard tu choi!")
    print("========================================")