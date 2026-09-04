import jwt

from services.auth_service import AuthService
from infrastructure.repositories.user_repository import UserRepository


print("=" * 70)
print("                 TEST JWT ACCESS TOKEN")
print("=" * 70)


# ==========================================================
# 1. CREATE USER REPOSITORY + AUTH SERVICE
# ==========================================================

print("\n[1] INIT AUTH SERVICE")

try:
    repository = UserRepository()

    auth_service = AuthService(repository)

    print("AuthService INIT SUCCESS!")

except Exception as e:
    print("AuthService INIT FAILED!")
    print("Loi:", e)
    raise SystemExit(1)


# ==========================================================
# 2. LOGIN
# ==========================================================

print("\n[2] LOGIN")

email = "admin@ar-imms.dc"
password = "123456"

try:

    result = auth_service.login(
        email,
        password
    )

    print("LOGIN SUCCESS!")

except Exception as e:

    print("LOGIN FAILED!")
    print("Loi:", e)

    raise SystemExit(1)


# ==========================================================
# 3. GET ACCESS TOKEN
# ==========================================================

print("\n[3] GET ACCESS TOKEN")

if not isinstance(result, dict):

    print("LOGIN RESULT không phải dictionary!")

    raise SystemExit(1)


token = result.get("access_token")


if not token:

    print("Không tìm thấy access_token!")

    print("Keys:", list(result.keys()))

    raise SystemExit(1)


print("Access Token: [DA TAO THANH CONG]")


# ==========================================================
# 4. DECODE JWT
# ==========================================================

print("\n[4] DECODE JWT")

try:

    decoded = auth_service.decode_access_token(token)

    print("JWT DECODE SUCCESS!")

except Exception as e:

    print("JWT DECODE FAILED!")
    print("Loi:", e)

    raise SystemExit(1)


# ==========================================================
# 5. DISPLAY CLAIMS
# ==========================================================

print("\n[5] JWT CLAIMS")

print("User ID :", decoded.get("sub"))
print("Email   :", decoded.get("email"))
print("Role    :", decoded.get("role"))
print("Status  :", decoded.get("status"))


# ==========================================================
# 6. CHECK ROLE
# ==========================================================

print("\n[6] CHECK ROLE")

role = decoded.get("role")

if role == "ADMIN":

    print("ROLE TEST SUCCESS!")
    print("Role = ADMIN")

else:

    print("ROLE TEST FAILED!")
    print("Expected: ADMIN")
    print("Actual  :", role)

    raise SystemExit(1)


# ==========================================================
# 7. CHECK STATUS
# ==========================================================

print("\n[7] CHECK STATUS")

status = decoded.get("status")

if status == "APPROVED":

    print("STATUS TEST SUCCESS!")
    print("Status = APPROVED")

else:

    print("STATUS TEST FAILED!")
    print("Expected: APPROVED")
    print("Actual  :", status)

    raise SystemExit(1)


# ==========================================================
# 8. CHECK EXPIRATION
# ==========================================================

print("\n[8] CHECK EXPIRATION")

if decoded.get("exp"):

    print("EXP claim exists!")
    print("JWT có thời gian hết hạn.")

else:

    print("WARNING: JWT chưa có exp claim.")


# ==========================================================
# 9. FINAL RESULT
# ==========================================================

print("\n" + "=" * 70)
print("                 JWT TEST SUCCESS")
print("=" * 70)

print("Supabase       : OK")
print("UserRepository : OK")
print("Bcrypt         : OK")
print("Login          : OK")
print("JWT            : OK")
print("Role           : ADMIN")
print("Status         : APPROVED")

print("=" * 70)