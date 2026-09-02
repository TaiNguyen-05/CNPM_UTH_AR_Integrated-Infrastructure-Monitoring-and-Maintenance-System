from flask import Blueprint, request, jsonify
from flasgger import swag_from
from marshmallow import ValidationError
from infrastructure.repositories.ar_repositories import NodeRepository
from services.ar_services import NodeService
from api.schemas.ar_schemas import NodeSchema
from api.responses import success_response, error_response

node_bp = Blueprint("nodes", __name__, url_prefix="/api/nodes")

# Khởi tạo Service và Repository theo nguyên lý Dependency Injection
node_repo = NodeRepository()
node_service = NodeService(node_repo)
node_schema = NodeSchema()
node_list_schema = NodeSchema(many=True)


@node_bp.route("", methods=["GET"])
def list_nodes():
    """
    Lấy danh sách tất cả Server Nodes (có thể lọc theo rack_id hoặc status)
    ---
    tags:
      - Server Nodes
    parameters:
      - name: rack_id
        in: query
        type: string
        required: false
        description: Lọc theo mã tủ rack (ví dụ rack-a1)
      - name: status
        in: query
        type: string
        required: false
        description: Lọc theo trạng thái (HEALTHY, WARNING, CRITICAL, OFFLINE)
      - name: qr
        in: query
        type: string
        required: false
        description: Tra cứu nhanh theo mã QR payload của AR
    responses:
      200:
        description: Danh sách Server Nodes
    """
    qr_query = request.args.get("qr")
    if qr_query:
        node = node_service.get_by_qr(qr_query)
        if not node:
            return error_response(f"Không tìm thấy node với mã QR: {qr_query}", status_code=404)
        return success_response(data=node.to_dict())

    filters = {}
    if request.args.get("rack_id"):
        filters["rack_id"] = request.args.get("rack_id")
    if request.args.get("status"):
        filters["status"] = request.args.get("status").upper()

    nodes = node_service.list_all(filters if filters else None)
    return success_response(data=[n.to_dict() for n in nodes])


@node_bp.route("/<node_id>", methods=["GET"])
def get_node(node_id):
    """
    Lấy thông tin chi tiết một Server Node theo ID
    ---
    tags:
      - Server Nodes
    parameters:
      - name: node_id
        in: path
        type: string
        required: true
        description: ID của node (ví dụ SRV-NODE-01)
    responses:
      200:
        description: Chi tiết Node
      404:
        description: Không tìm thấy node
    """
    node = node_service.get_by_id(node_id)
    if not node:
        return error_response(f"Không tìm thấy Server Node với ID: {node_id}", status_code=404)
    return success_response(data=node.to_dict())


@node_bp.route("", methods=["POST"])
def create_node():
    """
    Thêm mới một Server Node vào hệ thống
    ---
    tags:
      - Server Nodes
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - rack_id
            - name
            - u_start
            - ip_address
          properties:
            id:
              type: string
              example: SRV-NODE-04
            rack_id:
              type: string
              example: rack-a1
            name:
              type: string
              example: Compute Worker Node 04
            u_start:
              type: integer
              example: 26
            u_height:
              type: integer
              example: 2
            ip_address:
              type: string
              example: 192.168.1.104
            ram_total_gb:
              type: integer
              example: 64
            disk_total_gb:
              type: integer
              example: 2000
    responses:
      201:
        description: Tạo mới Server Node thành công
    """
    data = request.get_json() or {}
    try:
        validated_data = node_schema.load(data)
    except ValidationError as err:
        return error_response(message="Dữ liệu không hợp lệ", errors=err.messages, status_code=400)

    try:
        new_node = node_service.create_node(validated_data)
        return success_response(data=new_node.to_dict(), message="Tạo mới Server Node thành công", status_code=201)
    except Exception as e:
        return error_response(message=str(e), status_code=400)


@node_bp.route("/<node_id>", methods=["PUT"])
def update_node(node_id):
    """
    Cập nhật thông tin Server Node
    ---
    tags:
      - Server Nodes
    parameters:
      - name: node_id
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
            rack_id:
              type: string
            u_start:
              type: integer
            u_height:
              type: integer
            ip_address:
              type: string
            status:
              type: string
            ram_total_gb:
              type: integer
            disk_total_gb:
              type: integer
    responses:
      200:
        description: Cập nhật thành công
    """
    existing = node_service.get_by_id(node_id)
    if not existing:
        return error_response(f"Không tìm thấy Server Node với ID: {node_id}", status_code=404)

    data = request.get_json() or {}
    try:
        if "name" in data:
            existing.name = data["name"]
        if "rack_id" in data:
            existing.rack_id = data["rack_id"]
        if "u_start" in data:
            existing.u_start = int(data["u_start"])
        if "u_height" in data:
            existing.u_height = int(data["u_height"])
        if "ip_address" in data:
            existing.ip_address = data["ip_address"]
        if "status" in data:
            existing.status = data["status"]
        if "ram_total_gb" in data:
            existing.ram_total_gb = int(data["ram_total_gb"])
        if "disk_total_gb" in data:
            existing.disk_total_gb = int(data["disk_total_gb"])

        updated = node_service.update(existing)
        return success_response(data=updated.to_dict(), message="Cập nhật Server Node thành công")
    except Exception as e:
        return error_response(message=str(e), status_code=400)


@node_bp.route("/<node_id>", methods=["DELETE"])
def delete_node(node_id):
    """
    Xóa Server Node khỏi hệ thống
    ---
    tags:
      - Server Nodes
    parameters:
      - name: node_id
        in: path
        type: string
        required: true
    responses:
      200:
        description: Xóa thành công
    """
    success = node_service.delete(node_id)
    if not success:
        return error_response(f"Không tìm thấy Server Node với ID: {node_id}", status_code=404)
    return success_response(message=f"Đã xóa Server Node {node_id} thành công")


@node_bp.route("/<node_id>/telemetry", methods=["POST"])
def update_telemetry(node_id):
    """
    Cập nhật dữ liệu đo lường thời gian thực (Telemetry stream) của Server Node
    ---
    tags:
      - Server Nodes
    parameters:
      - name: node_id
        in: path
        type: string
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            cpu:
              type: number
              example: 65.4
            ram:
              type: number
              example: 72.0
            disk:
              type: number
              example: 45.1
            temp:
              type: number
              example: 52.3
            netIn:
              type: number
              example: 240.0
            netOut:
              type: number
              example: 512.0
    responses:
      200:
        description: Cập nhật telemetry thành công
    """
    data = request.get_json() or {}
    try:
        updated = node_service.update_telemetry(
            node_id=node_id,
            cpu=data.get("cpu", 0.0),
            ram=data.get("ram", 0.0),
            disk=data.get("disk", 0.0),
            temp=data.get("temp", 0.0),
            net_in=data.get("netIn", 0.0),
            net_out=data.get("netOut", 0.0),
        )
        return success_response(data=updated.to_dict(), message="Cập nhật telemetry thành công")
    except Exception as e:
        return error_response(message=str(e), status_code=400)
