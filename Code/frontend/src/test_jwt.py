import jwt

from services.auth_service import AuthService


print("=" * 70)
print("                 TEST JWT ACCESS TOKEN")
print("=" * 70)


auth_service = AuthService()


print("\n[1] LOGIN")

email = "admin@ar-imms.dc"
password = "123456"

result = auth_service.login(
    email=email,
    password=password
)

print("LOGIN SUCCESS!")
print("Email:", result["user"]["email"])
print("Role:", result["user"]["role"])
print("Status:", result["user"]["status"])
print("Token type:", result["token_type"])


print("\n[2] ACCESS TOKEN")

token = result["access_token"]

print("Token created successfully!")


print("\n[3] DECODE JWT")

payload = auth_service.decode_access_token(token)

print("Decode SUCCESS!")

print("sub:", payload["sub"])
print("email:", payload["email"])
print("role:", payload["role"])
print("status:", payload["status"])
print("iat:", payload["iat"])
print("exp:", payload["exp"])


print("\n[4] CHECK ROLE + STATUS")

role_ok = payload["role"] == "ADMIN"
status_ok = payload["status"] == "APPROVED"

print("Role ADMIN:", role_ok)
print("Status APPROVED:", status_ok)


print("\n" + "=" * 70)

if role_ok and status_ok:
    print("             JWT TEST SUCCESS!")
    print("             LOGIN + JWT + ROLE + STATUS OK!")
else:
    print("             JWT TEST FAILED!")

print("=" * 70)