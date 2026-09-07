from flask import Blueprint, request
from marshmallow import ValidationError

from infrastructure.repositories.ar_repositories import UserRepository
from services.ar_services import UserService
from api.schemas.ar_schemas import UserSchema
from api.responses import success_response, error_response
from api.jwt_guard import jwt_required


# ============================================================
# BLUEPRINT
# ============================================================

user_bp = Blueprint(
    "users",
    __name__,
    url_prefix="/api/users"
)


# ============================================================
# REPOSITORY + SERVICE + SCHEMA
# ============================================================

user_repo = UserRepository()
user_service = UserService(user_repo)
user_schema = UserSchema()


# ============================================================
# GET ALL USERS
# ============================================================

@user_bp.route("", methods=["GET"])
def list_users():

    status = request.args.get("status")
    role = request.args.get("role")

    filters = {}

    if status:
        filters["status"] = status.upper()

    if role:
        filters["role"] = role.upper()

    users = user_service.list_all(
        filters if filters else None
    )

    return success_response(
        data=[
            u.to_dict()
            for u in users
        ]
    )


# ============================================================
# GET USER BY ID OR EMAIL
# ============================================================

@user_bp.route("/<user_id>", methods=["GET"])
def get_user(user_id):

    user = (
        user_service.get_by_id(user_id)
        or user_service.get_by_email(user_id)
    )

    if not user:

        return error_response(
            f"Không tìm thấy người dùng: {user_id}",
            status_code=404
        )

    return success_response(
        data=user.to_dict()
    )


# ============================================================
# CREATE USER
# ============================================================

@user_bp.route("", methods=["POST"])
def create_user():

    data = request.get_json(
        silent=True
    ) or {}

    try:

        validated_data = user_schema.load(
            data
        )

    except ValidationError as err:

        return error_response(
            message="Dữ liệu không hợp lệ",
            errors=err.messages,
            status_code=400
        )

    try:

        new_user = user_service.create_user(
            validated_data
        )

        return success_response(
            data=new_user.to_dict(),
            message="Đăng ký tài khoản thành công",
            status_code=201
        )

    except Exception as e:

        return error_response(
            message=str(e),
            status_code=400
        )


# ============================================================
# APPROVE USER
# ADMIN ONLY
# ============================================================

@user_bp.route(
    "/<user_id>/approve",
    methods=["POST"]
)
def approve_user(user_id):

    current_user = getattr(
        request,
        "current_user",
        None
    )

    approver_id = current_user.get("user_id") if current_user else "admin-root"

    try:
        user = user_service.approve_user(
            user_id,
            approver_id
        )

        # Gửi email chào mừng đã được duyệt
        try:
            from services.email_service import email_service
            if user.email:
                email_service.send_welcome_approved_email(
                    recipient_email=user.email,
                    full_name=user.full_name,
                    role=user.role
                )
        except Exception as mail_err:
            print(f"[UserController] Lỗi gửi email chào mừng: {mail_err}")

        return success_response(
            data=user.to_dict(),
            message=(
                f"Đã phê duyệt tài khoản "
                f"{user.full_name}"
            )
        )

    except Exception as e:
        return error_response(
            message=str(e),
            status_code=400
        )


# ============================================================
# GOOGLE OAUTH LOGIN / SIGNUP
# ============================================================

@user_bp.route("/google", methods=["POST"])
def google_auth():
    """
    Đăng nhập hoặc Đăng ký nhanh qua Google OAuth
    """
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    full_name = data.get("full_name") or data.get("name") or (email.split("@")[0] if email else "Google User")
    avatar = data.get("avatar") or data.get("picture")

    if not email:
        return error_response("Email Google là bắt buộc", status_code=400)

    try:
        existing_user = user_service.get_by_email(email)
        if existing_user:
            return success_response(
                data=existing_user.to_dict(),
                message="Đăng nhập Google thành công"
            )

        # Tạo tài khoản mới với vai trò TECHNICIAN và trạng thái PENDING_APPROVAL
        new_user = user_service.create_user({
            "email": email,
            "full_name": full_name,
            "role": "TECHNICIAN",
            "status": "PENDING_APPROVAL",
            "avatar": avatar,
            "department": "AR Maintenance Operations"
        })

        return success_response(
            data=new_user.to_dict(),
            message="Đăng ký tài khoản Google thành công. Đang chờ Quản trị viên phê duyệt.",
            status_code=201
        )
    except Exception as e:
        return error_response(message=str(e), status_code=400)


# ============================================================
# TEST EMAIL DISPATCH ENDPOINT
# ============================================================

@user_bp.route("/test-email", methods=["POST"])
def test_send_email():
    """
    Gửi email thử nghiệm sự cố khẩn cấp đến Gmail chỉ định hoặc tất cả Kỹ thuật viên đã duyệt
    """
    data = request.get_json(silent=True) or {}
    target_email = data.get("email")

    recipients = []
    if target_email:
        recipients = [target_email]
    else:
        approved_techs = user_service.list_all({"role": "TECHNICIAN", "status": "APPROVED"})
        recipients = [u.email for u in approved_techs if u.email]

    if not recipients:
        return error_response("Không tìm thấy email người nhận hợp lệ.", status_code=400)

    try:
        from services.email_service import email_service
        success = email_service.send_incident_alert(
            node_id="SRV-NODE-01",
            node_name="Primary Compute Node 01",
            rack_id="Rack A1 (Zone Alpha)",
            severity="CRITICAL",
            message="[TEST] Tín hiệu Heartbeat bị gián đoạn > 90s. Kiểm tra kết nối mạng và nguồn điện.",
            recipients=recipients
        )
        return success_response(
            message=f"Đã gửi email thử nghiệm sự cố tới: {', '.join(recipients)}",
            data={"recipients": recipients, "success": success}
        )
    except Exception as e:
        return error_response(message=f"Lỗi gửi email: {str(e)}", status_code=500)


# ============================================================
# LOCK USER
# ADMIN ONLY
# ============================================================

@user_bp.route(
    "/<user_id>/lock",
    methods=["POST"]
)
def lock_user(user_id):

    try:
        user = user_service.lock_user(user_id)
        return success_response(
            data=user.to_dict(),
            message=f"Đã khóa tài khoản {user.full_name}"
        )
    except Exception as e:
        return error_response(message=str(e), status_code=400)


# ============================================================
# UNLOCK USER
# ADMIN ONLY
# ============================================================

@user_bp.route(
    "/<user_id>/unlock",
    methods=["POST"]
)
def unlock_user(user_id):

    try:
        user = user_service.unlock_user(user_id)
        return success_response(
            data=user.to_dict(),
            message=f"Đã mở khóa tài khoản {user.full_name}"
        )
    except Exception as e:
        return error_response(message=str(e), status_code=400)


# ============================================================
# UPDATE USER ROLE
# ADMIN ONLY
# ============================================================

@user_bp.route(
    "/<user_id>/role",
    methods=["POST", "PUT"]
)
def update_user_role(user_id):

    data = request.get_json(silent=True) or {}
    new_role = data.get("role") or data.get("new_role")

    if not new_role:
        return error_response("Tham số role là bắt buộc", status_code=400)

    try:
        user = user_service.update_role(user_id, new_role.upper())
        return success_response(
            data=user.to_dict(),
            message=f"Đã cập nhật vai trò {user.full_name} -> {new_role}"
        )
    except Exception as e:
        return error_response(message=str(e), status_code=400)


# ============================================================
# DELETE USER
# ADMIN ONLY
# ============================================================

@user_bp.route(
    "/<user_id>",
    methods=["DELETE"]
)
def delete_user(user_id):

    success = user_service.delete_user(user_id)
    if not success:
        return error_response(f"Không tìm thấy người dùng: {user_id}", status_code=404)

    return success_response(message=f"Đã xóa tài khoản {user_id} thành công")