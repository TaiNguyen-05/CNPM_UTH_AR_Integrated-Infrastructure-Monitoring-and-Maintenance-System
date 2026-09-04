import bcrypt


print("=" * 70)
print("                 TEST BCRYPT")
print("=" * 70)


# ============================================================
# 1. PASSWORD GỐC
# ============================================================

password = "123456"

print("\n[1] PASSWORD GOC")
print("Password:", password)


# ============================================================
# 2. HASH PASSWORD
# ============================================================

password_bytes = password.encode("utf-8")

salt = bcrypt.gensalt()

password_hash = bcrypt.hashpw(
    password_bytes,
    salt
)

print("\n[2] HASH PASSWORD")
print("Hash:", password_hash.decode("utf-8"))


# ============================================================
# 3. VERIFY PASSWORD ĐÚNG
# ============================================================

correct_password = "123456"

result_correct = bcrypt.checkpw(
    correct_password.encode("utf-8"),
    password_hash
)

print("\n[3] VERIFY PASSWORD DUNG")
print("Ket qua:", result_correct)


# ============================================================
# 4. VERIFY PASSWORD SAI
# ============================================================

wrong_password = "654321"

result_wrong = bcrypt.checkpw(
    wrong_password.encode("utf-8"),
    password_hash
)

print("\n[4] VERIFY PASSWORD SAI")
print("Ket qua:", result_wrong)


# ============================================================
# 5. KẾT LUẬN
# ============================================================

if result_correct is True and result_wrong is False:

    print("\nBCRYPT TEST SUCCESS!")

else:

    print("\nBCRYPT TEST FAILED!")


print("\n" + "=" * 70)
print("                 BCRYPT TEST FINISHED")
print("=" * 70)