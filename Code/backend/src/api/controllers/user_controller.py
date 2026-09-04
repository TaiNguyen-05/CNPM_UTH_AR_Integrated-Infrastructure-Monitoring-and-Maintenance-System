from flask import Blueprint, request
from marshmallow import ValidationError

from infrastructure.repositories.ar_repositories import UserRepository
from services.ar_services import UserService
from api.schemas.ar_schemas import UserSchema
from api.responses import success_response, error_response
from api.jwt_guard import jwt_required


user_bp = Blueprint("users", __name__, url_prefix="/api/users")

user_repo = UserRepository()
user_service = UserService(user_repo)
user_schema = UserSchema()


@user_bp.route("", methods=["GET"])
def list_users():
    """
    Lấy danh sách tài khoản người dùng (có thể lọc theo status hoặc role)
    ---
    tags:
      - Users & Access Control
    parameters:
      - name: status
        in: query
        type: string
        required: false
        description: Lọc theo trạng thái (APPROVED, PENDING_APPROVAL, LOCKED)
      - name: role
        in: query
        type: string
        required: false
        description: Lọc theo vai trò (ADMIN, OPERATOR, TECHNICIAN)
    responses:
      200:
        description: Danh sách người dùng
    """
    status = request.args.get("status")
    role = request.args.get("role")

    filters = {}

    if status:
        filters["status"] = status.upper()

    if role:
        filters["role"] = role.upper()

    users = user_service.list_all(filters if filters else None)

    return success_response(
        data=[u.to_dict() for u in users]
    )


@user_bp.route("/<user_id>", methods=["GET"])
def get_user(user_id):
    """
    Lấy thông tin chi tiết tài khoản theo ID hoặc Email
    ---
    tags:
      - Users & Access Control
    parameters:
      - name: user_id
        in: path
        type: string
        required: true
    responses:
      200:
        description: Chi tiết người dùng
      404:
        description: Không tìm thấy
    """
    user = user_service.get_by_id(user_id) or user_service.get_by_email(user_id)

    if not user:
        return error_response(
            f"Không tìm thấy người dùng: {user_id}",
            status_code=404
        )

    return success_response(data=user.to_dict())


@user_bp.route("", methods=["POST"])
def create_user():
    """
    Đăng ký / Thêm mới tài khoản người dùng
    ---
    tags:
      - Users & Access Control
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - full_name
          properties:
            id:
              type: string
              example: USR-004
            email:
              type: string
              example: tech.lequangc@ar-imms.dc
            full_name:
              type: string
              example: Le Quang C
            role:
              type: string
              example: TECHNICIAN
            department:
              type: string
              example: Hardware Maintenance
            phone_number:
              type: string
              example: 0901234567
    responses:
      201:
        description: Đăng ký thành công
    """
    data = request.get_json() or {}

    try:
        validated_data = user_schema.load(data)

    except ValidationError as err:
        return error_response(
            message="Dữ liệu không hợp lệ",
            errors=err.messages,
            status_code=400
        )

    try:
        new_user = user_service.create_user(validated_data)

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


@user_bp.route("/<user_id>/approve", methods=["POST"])
@jwt_required
def approve_user(user_id):
    """
    Admin phê duyệt tài khoản kỹ thuật viên
    ---
    tags:
      - Users & Access Control
    parameters:
      - name: user_id
        in: path
        type: string
        required: true
      - in: body
        name: body
        required: false
        schema:
          type: object
          properties:
            approver_id:
              type: string
              example: USR-001
    responses:
      200:
        description: Phê duyệt thành công
    """
    data = request.get_json() or {}

    approver_id = data.get("approver_id", "ADMIN")

    try:
        user = user_service.approve_user(
            user_id,
            approver_id
        )

        return success_response(
            data=user.to_dict(),
            message=f"Đã phê duyệt tài khoản {user.full_name}"
        )

    except Exception as e:
        return error_response(
            message=str(e),
            status_code=400
        )


@user_bp.route("/<user_id>/lock", methods=["POST"])
@jwt_required
def lock_user(user_id):
    """
    Khóa tài khoản người dùng
    ---
    tags:
      - Users & Access Control
    parameters:
      - name: user_id
        in: path
        type: string
        required: true
    responses:
      200:
        description: Khóa tài khoản thành công
    """
    try:
        user = user_service.lock_user(user_id)

        return success_response(
            data=user.to_dict(),
            message=f"Đã khóa tài khoản {user.full_name}"
        )

    except Exception as e:
        return error_response(
            message=str(e),
            status_code=400
        )


@user_bp.route("/<user_id>", methods=["DELETE"])
@jwt_required
def delete_user(user_id):
    """
    Xóa tài khoản người dùng
    ---
    tags:
      - Users & Access Control
    parameters:
      - name: user_id
        in: path
        type: string
        required: true
    responses:
      200:
        description: Xóa thành công
    """
    success = user_service.delete(user_id)

    if not success:
        return error_response(
            f"Không tìm thấy người dùng: {user_id}",
            status_code=404
        )

    return success_response(
        message=f"Đã xóa tài khoản {user_id} thành công"
    )