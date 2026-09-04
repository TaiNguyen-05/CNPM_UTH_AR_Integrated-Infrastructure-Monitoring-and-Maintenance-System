import sys
import os

# Thêm thư mục src vào Python path
SRC_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from services.auth_service import AuthService
from infrastructure.repositories.user_repository import UserRepository


EMAIL = "admin@ar-imms.dc"


print("========================================")
print("       CREATE REAL JWT")
print("========================================")


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
    print()
    print("JWT:")
    print(token)

except Exception as e:
    print("Login: FAIL")
    print("Error:", str(e))