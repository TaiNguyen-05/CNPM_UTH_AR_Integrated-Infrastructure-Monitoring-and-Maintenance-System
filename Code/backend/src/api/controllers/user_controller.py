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
@jwt_required(roles=["ADMIN"])
def approve_user(user_id):

    current_user = getattr(
        request,
        "current_user",
        None
    )

    if not current_user:

        return error_response(
            message=(
                "Không tìm thấy thông tin "
                "người dùng trong JWT"
            ),
            status_code=401
        )

    approver_id = current_user.get("sub")

    if not approver_id:

        return error_response(
            message="JWT không chứa user ID (sub)",
            status_code=401
        )

    try:

        user = user_service.approve_user(
            user_id,
            approver_id
        )

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
# LOCK USER
# ADMIN ONLY
# ============================================================

@user_bp.route(
    "/<user_id>/lock",
    methods=["POST"]
)
@jwt_required(roles=["ADMIN"])
def lock_user(user_id):

    try:

        user = user_service.lock_user(
            user_id
        )

        return success_response(
            data=user.to_dict(),
            message=(
                f"Đã khóa tài khoản "
                f"{user.full_name}"
            )
        )

    except Exception as e:

        return error_response(
            message=str(e),
            status_code=400
        )


# ============================================================
# DELETE USER
# ADMIN ONLY
# ============================================================

@user_bp.route(
    "/<user_id>",
    methods=["DELETE"]
)
@jwt_required(roles=["ADMIN"])
def delete_user(user_id):

    success = user_service.delete(
        user_id
    )

    if not success:

        return error_response(
            f"Không tìm thấy người dùng: {user_id}",
            status_code=404
        )

    return success_response(
        message=(
            f"Đã xóa tài khoản "
            f"{user_id} thành công"
        )
    )