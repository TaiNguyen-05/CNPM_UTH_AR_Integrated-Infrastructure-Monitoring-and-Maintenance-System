from functools import wraps

from flask import request, jsonify

from services.auth_service import AuthService
from infrastructure.repositories.user_repository import UserRepository


def jwt_required(roles=None):
    """
    JWT Authentication + Role Authorization Guard

    @jwt_required()
        -> JWT hợp lệ + tài khoản APPROVED

    @jwt_required(roles=["ADMIN"])
        -> Chỉ ADMIN

    @jwt_required(roles=["ADMIN", "OPERATOR"])
        -> ADMIN hoặc OPERATOR
    """

    # Chuẩn hóa roles ngay khi tạo decorator
    allowed_roles = None

    if roles:
        allowed_roles = [
            str(role).upper()
            for role in roles
        ]

    def decorator(f):

        @wraps(f)
        def decorated(*args, **kwargs):

            print("\n" + "=" * 60)
            print("[JWT GUARD] REQUEST:", request.method, request.path)
            print("[JWT GUARD] Allowed roles:", allowed_roles)
            print("=" * 60)

            # ==================================================
            # 1. KIỂM TRA AUTHORIZATION HEADER
            # ==================================================

            auth_header = request.headers.get("Authorization")

            if not auth_header:

                print(
                    "[JWT GUARD] DENIED: Missing Authorization"
                )

                return jsonify({
                    "success": False,
                    "error": "Missing Authorization header"
                }), 401

            parts = auth_header.split()

            if (
                len(parts) != 2
                or parts[0].lower() != "bearer"
            ):

                print(
                    "[JWT GUARD] DENIED: Invalid Authorization"
                )

                return jsonify({
                    "success": False,
                    "error": "Invalid Authorization header"
                }), 401

            token = parts[1]

            # ==================================================
            # 2. DECODE JWT
            # ==================================================

            try:

                auth_service = AuthService(
                    UserRepository()
                )

                payload = auth_service.decode_access_token(
                    token
                )

                print(
                    "[JWT GUARD] Decode PASS"
                )

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

            # ==================================================
            # 3. LẤY THÔNG TIN JWT
            # ==================================================

            current_role = payload.get("role")
            current_status = payload.get("status")

            print(
                "[JWT GUARD] User ID:",
                payload.get("sub")
            )

            print(
                "[JWT GUARD] Email:",
                payload.get("email")
            )

            print(
                "[JWT GUARD] Role:",
                current_role
            )

            print(
                "[JWT GUARD] Status:",
                current_status
            )

            # ==================================================
            # 4. KIỂM TRA STATUS
            # ==================================================

            if current_status != "APPROVED":

                print(
                    "[JWT GUARD] STATUS DENIED:",
                    current_status
                )

                return jsonify({
                    "success": False,
                    "error": "User account is not approved"
                }), 403

            # ==================================================
            # 5. KIỂM TRA ROLE
            # ==================================================

            if allowed_roles is not None:

                if not current_role:

                    print(
                        "[JWT GUARD] ROLE DENIED: "
                        "JWT không có role"
                    )

                    return jsonify({
                        "success": False,
                        "error": "Forbidden: role missing"
                    }), 403

                current_role = str(
                    current_role
                ).upper()

                print(
                    "[JWT GUARD] Current role:",
                    current_role
                )

                print(
                    "[JWT GUARD] Allowed roles:",
                    allowed_roles
                )

                if current_role not in allowed_roles:

                    print(
                        "[JWT GUARD] ROLE DENIED:",
                        current_role
                    )

                    return jsonify({
                        "success": False,
                        "error": "Forbidden: insufficient role"
                    }), 403

                print(
                    "[JWT GUARD] ROLE PASS:",
                    current_role
                )

            # ==================================================
            # 6. LƯU USER HIỆN TẠI
            # ==================================================

            request.current_user = payload

            print(
                "[JWT GUARD] AUTHENTICATION PASS"
            )

            # ==================================================
            # 7. CHO REQUEST ĐI TIẾP
            # ==================================================

            return f(*args, **kwargs)

        return decorated

    return decorator