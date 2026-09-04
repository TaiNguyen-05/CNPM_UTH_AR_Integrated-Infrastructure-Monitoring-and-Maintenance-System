from functools import wraps

from flask import request, jsonify

from services.auth_service import AuthService
from infrastructure.repositories.user_repository import UserRepository


def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        # ========================================
        # 1. Lấy Authorization Header
        # ========================================
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({
                "success": False,
                "error": "Missing Authorization header"
            }), 401

        # ========================================
        # 2. Kiểm tra định dạng Bearer Token
        # ========================================
        parts = auth_header.split()

        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({
                "success": False,
                "error": "Invalid Authorization header"
            }), 401

        token = parts[1]

        # ========================================
        # 3. Decode và kiểm tra JWT
        # ========================================
        try:

            auth_service = AuthService(
                UserRepository()
            )

            # DEBUG - chỉ in độ dài secret, KHÔNG in secret
            print(
                "[JWT GUARD] Secret length:",
                len(auth_service.secret_key)
            )

            print(
                "[JWT GUARD] Token received:",
                bool(token)
            )

            # Giải mã JWT
            payload = auth_service.decode_access_token(token)

            print("[JWT GUARD] Decode PASS")

            # Chỉ in thông tin an toàn trong payload
            print(
                "[JWT GUARD] Role:",
                payload.get("role")
            )

            print(
                "[JWT GUARD] Status:",
                payload.get("status")
            )

            # ========================================
            # 4. Kiểm tra status trong JWT
            # ========================================
            if payload.get("status") != "APPROVED":

                return jsonify({
                    "success": False,
                    "error": "User account is not approved"
                }), 403

            # ========================================
            # 5. Lưu user hiện tại vào request
            # ========================================
            request.current_user = payload

            # ========================================
            # 6. Cho request đi tiếp
            # ========================================
            return f(*args, **kwargs)

        except ValueError as e:

            print(
                "[JWT GUARD] Decode FAILED:",
                str(e)
            )

            return jsonify({
                "success": False,
                "error": str(e)
            }), 401

        except Exception as e:

            print(
                "[JWT GUARD] Authentication error:",
                str(e)
            )

            return jsonify({
                "success": False,
                "error": "Authentication failed"
            }), 401

    return decorated