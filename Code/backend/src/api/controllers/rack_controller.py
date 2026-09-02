from flask import Blueprint, request
from marshmallow import ValidationError
from infrastructure.repositories.ar_repositories import RackRepository
from services.ar_services import RackService
from api.schemas.ar_schemas import RackSchema
from api.responses import success_response, error_response

rack_bp = Blueprint("racks", __name__, url_prefix="/api/racks")

rack_repo = RackRepository()
rack_service = RackService(rack_repo)
rack_schema = RackSchema()


@rack_bp.route("", methods=["GET"])
def list_racks():
    """
    Lấy danh sách tất cả các Tủ Rack trong hệ thống
    ---
    tags:
      - Racks
    responses:
      200:
        description: Danh sách Tủ Rack
    """
    racks = rack_service.list_all()
    return success_response(data=[r.to_dict() for r in racks])


@rack_bp.route("/<rack_id>", methods=["GET"])
def get_rack(rack_id):
    """
    Lấy thông tin chi tiết Tủ Rack theo ID hoặc Mã Code
    ---
    tags:
      - Racks
    parameters:
      - name: rack_id
        in: path
        type: string
        required: true
    responses:
      200:
        description: Chi tiết Tủ Rack
      404:
        description: Không tìm thấy
    """
    rack = rack_service.get_by_id(rack_id) or rack_service.get_by_code(rack_id)
    if not rack:
        return error_response(f"Không tìm thấy Tủ Rack: {rack_id}", status_code=404)
    return success_response(data=rack.to_dict())


@rack_bp.route("", methods=["POST"])
def create_rack():
    """
    Thêm mới một Tủ Rack
    ---
    tags:
      - Racks
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
            - code
          properties:
            id:
              type: string
              example: rack-b1
            name:
              type: string
              example: Rack B1 - GPU Training Cluster
            code:
              type: string
              example: RACK-B1
            room_name:
              type: string
              example: Server Room 02
            total_u:
              type: integer
              example: 42
            power_limit_kw:
              type: number
              example: 20.0
    responses:
      201:
        description: Tạo mới thành công
    """
    data = request.get_json() or {}
    try:
        validated_data = rack_schema.load(data)
    except ValidationError as err:
        return error_response(message="Dữ liệu không hợp lệ", errors=err.messages, status_code=400)

    try:
        new_rack = rack_service.create_rack(validated_data)
        return success_response(data=new_rack.to_dict(), message="Tạo mới Tủ Rack thành công", status_code=201)
    except Exception as e:
        return error_response(message=str(e), status_code=400)


@rack_bp.route("/<rack_id>", methods=["PUT"])
def update_rack(rack_id):
    """
    Cập nhật thông tin Tủ Rack
    ---
    tags:
      - Racks
    parameters:
      - name: rack_id
        in: path
        type: string
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
            total_u:
              type: integer
            power_limit_kw:
              type: number
    responses:
      200:
        description: Cập nhật thành công
    """
    existing = rack_service.get_by_id(rack_id)
    if not existing:
        return error_response(f"Không tìm thấy Tủ Rack: {rack_id}", status_code=404)

    data = request.get_json() or {}
    try:
        if "name" in data:
            existing.name = data["name"]
        if "total_u" in data:
            existing.total_u = int(data["total_u"])
        if "power_limit_kw" in data:
            existing.power_limit_kw = float(data["power_limit_kw"])

        updated = rack_service.update(existing)
        return success_response(data=updated.to_dict(), message="Cập nhật Tủ Rack thành công")
    except Exception as e:
        return error_response(message=str(e), status_code=400)


@rack_bp.route("/<rack_id>", methods=["DELETE"])
def delete_rack(rack_id):
    """
    Xóa Tủ Rack khỏi hệ thống
    ---
    tags:
      - Racks
    parameters:
      - name: rack_id
        in: path
        type: string
        required: true
    responses:
      200:
        description: Xóa thành công
    """
    success = rack_service.delete(rack_id)
    if not success:
        return error_response(f"Không tìm thấy Tủ Rack: {rack_id}", status_code=404)
    return success_response(message=f"Đã xóa Tủ Rack {rack_id} thành công")
