import bcrypt

from infrastructure.repositories.user_repository import UserRepository


print("=" * 70)
print("              TEST USER AUTH - BCRYPT")
print("=" * 70)


repository = UserRepository()

# ==========================================================
# 1. LẤY USER TỪ SUPABASE
# ==========================================================

print("\n[1] TIM USER TRONG SUPABASE")

email = "admin@ar-imms.dc"

user = repository.get_by_email(email)

if not user:
    print("KHONG TIM THAY USER!")
    raise SystemExit(1)

print("TIM USER SUCCESS!")
print("Email:", user.email)
print("Ho ten:", user.full_name)
print("Role:", user.role)
print("Status:", user.status)


# ==========================================================
# 2. KIỂM TRA PASSWORD HASH
# ==========================================================

print("\n[2] KIEM TRA PASSWORD HASH")

if not user.password_hash:
    print("USER CHUA CO PASSWORD HASH!")
    raise SystemExit(1)

print("Password hash ton tai!")
print("Hash:", user.password_hash)


# ==========================================================
# 3. TEST PASSWORD DUNG
# ==========================================================

print("\n[3] TEST PASSWORD DUNG")

password_correct = "123456"

result_correct = bcrypt.checkpw(
    password_correct.encode("utf-8"),
    user.password_hash.encode("utf-8")
)

print("Password:", password_correct)
print("Ket qua:", result_correct)


# ==========================================================
# 4. TEST PASSWORD SAI
# ==========================================================

print("\n[4] TEST PASSWORD SAI")

password_wrong = "654321"

result_wrong = bcrypt.checkpw(
    password_wrong.encode("utf-8"),
    user.password_hash.encode("utf-8")
)

print("Password:", password_wrong)
print("Ket qua:", result_wrong)


# ==========================================================
# 5. KET LUAN
# ==========================================================

print("\n" + "=" * 70)

if result_correct is True and result_wrong is False:
    print("       USER AUTHENTICATION TEST SUCCESS!")
    print("       Supabase + UserRepository + Bcrypt OK!")
else:
    print("       USER AUTHENTICATION TEST FAILED!")

print("=" * 70)