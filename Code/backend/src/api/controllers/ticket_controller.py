from flask import Blueprint, request, current_app
from marshmallow import ValidationError
from infrastructure.repositories.ar_repositories import TicketRepository
from services.ar_services import TicketService
from api.schemas.ar_schemas import TicketSchema
from api.responses import success_response, error_response

ticket_bp = Blueprint("tickets", __name__, url_prefix="/api/tickets")

ticket_repo = TicketRepository()
ticket_service = TicketService(ticket_repo)
ticket_schema = TicketSchema()


def _emit_socket(event_name, payload):
    socketio = getattr(current_app, 'socketio', None)
    if socketio:
        socketio.emit(event_name, payload)
        socketio.emit("stats_updated", {})


@ticket_bp.route("", methods=["GET"])
def list_tickets():
    """
    Lấy danh sách các Phiếu Bảo trì (có thể lọc theo status, technician_id, node_id)
    ---
    tags:
      - Maintenance Tickets
    parameters:
      - name: status
        in: query
        type: string
        required: false
        description: Lọc theo trạng thái (CREATED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED)
      - name: technician_id
        in: query
        type: string
        required: false
        description: Lọc theo ID kỹ thuật viên được phân công
      - name: node_id
        in: query
        type: string
        required: false
        description: Lọc theo Server Node ID
    responses:
      200:
        description: Danh sách Phiếu Bảo trì
    """
    status = request.args.get("status")
    tech_id = request.args.get("technician_id")
    node_id = request.args.get("node_id")

    if status:
        tickets = ticket_repo.list_by_status(status.upper())
    elif tech_id:
        tickets = ticket_repo.list_by_technician(tech_id)
    else:
        filters = {}
        if node_id:
            filters["server_node_id"] = node_id
        tickets = ticket_service.list_all(filters if filters else None)

    return success_response(data=[t.to_dict() for t in tickets])


@ticket_bp.route("/<ticket_id>", methods=["GET"])
def get_ticket(ticket_id):
    """
    Lấy thông tin chi tiết một Phiếu Bảo trì theo ID
    ---
    tags:
      - Maintenance Tickets
    parameters:
      - name: ticket_id
        in: path
        type: string
        required: true
    responses:
      200:
        description: Chi tiết Phiếu Bảo trì
      404:
        description: Không tìm thấy
    """
    ticket = ticket_service.get_by_id(ticket_id)
    if not ticket:
        return error_response(f"Không tìm thấy phiếu bảo trì: {ticket_id}", status_code=404)
    return success_response(data=ticket.to_dict())


@ticket_bp.route("", methods=["POST"])
def create_ticket():
    """
    Tạo mới một Phiếu Bảo trì (Maintenance Ticket)
    ---
    tags:
      - Maintenance Tickets
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - server_node_id
            - title
          properties:
            server_node_id:
              type: string
              example: SRV-NODE-02
            title:
              type: string
              example: Check Power Supply Unit Redundancy
            description:
              type: string
              example: PSU 2 lost AC input power. Verify PDU circuit and cord.
            priority:
              type: string
              example: HIGH
            alert_id:
              type: string
              example: ALT-2026-1001
            assigned_technician_id:
              type: string
              example: USR-003
            assigned_technician_name:
              type: string
              example: Nguyen Van B
    responses:
      201:
        description: Tạo mới Phiếu Bảo trì thành công
    """
    data = request.get_json() or {}
    try:
        validated_data = ticket_schema.load(data)
    except ValidationError as err:
        return error_response(message="Dữ liệu không hợp lệ", errors=err.messages, status_code=400)

    try:
        new_ticket = ticket_service.create_ticket(validated_data)
        ticket_dict = new_ticket.to_dict()
        _emit_socket("ticket_created", ticket_dict)
        return success_response(data=ticket_dict, message="Tạo mới Phiếu Bảo trì thành công", status_code=201)
    except Exception as e:
        return error_response(message=str(e), status_code=400)


@ticket_bp.route("/<ticket_id>/assign", methods=["POST"])
def assign_technician(ticket_id):
    """
    Phân công Kỹ thuật viên phụ trách phiếu bảo trì
    ---
    tags:
      - Maintenance Tickets
    parameters:
      - name: ticket_id
        in: path
        type: string
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - technician_id
          properties:
            technician_id:
              type: string
              example: USR-003
            technician_name:
              type: string
              example: Nguyen Van B
    responses:
      200:
        description: Phân công thành công
    """
    data = request.get_json() or {}
    tech_id = data.get("technician_id")
    tech_name = data.get("technician_name")

    if not tech_id:
        return error_response("Vui lòng cung cấp mã kỹ thuật viên (technician_id)", status_code=400)

    try:
        ticket = ticket_service.assign_technician(ticket_id, tech_id, tech_name)
        ticket_dict = ticket.to_dict()
        _emit_socket("ticket_updated", ticket_dict)
        _emit_socket("ticket_assigned", ticket_dict)
        return success_response(data=ticket_dict, message="Phân công kỹ thuật viên thành công")
    except Exception as e:
        return error_response(message=str(e), status_code=400)


@ticket_bp.route("/<ticket_id>/ar-log", methods=["POST"])
def add_ar_log(ticket_id):
    """
    Ghi nhận log thao tác từ ứng dụng AR của kỹ thuật viên tại hiện trường
    ---
    tags:
      - Maintenance Tickets
    parameters:
      - name: ticket_id
        in: path
        type: string
        required: true
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - action
          properties:
            action:
              type: string
              example: QR_SCANNED
            details:
              type: object
              example: {"target": "SRV-NODE-02", "confidence": 0.98}
    responses:
      200:
        description: Ghi log AR thành công
    """
    data = request.get_json() or {}
    action = data.get("action", "AR_INSPECTION")
    details = data.get("details", {})
    try:
        ticket = ticket_service.add_ar_log(ticket_id, action, details)
        ticket_dict = ticket.to_dict()
        _emit_socket("ticket_updated", ticket_dict)
        return success_response(data=ticket_dict, message="Ghi nhận nhật ký AR thành công")
    except Exception as e:
        return error_response(message=str(e), status_code=400)


@ticket_bp.route("/<ticket_id>/resolve", methods=["POST"])
def resolve_ticket(ticket_id):
    """
    Kỹ thuật viên hoàn tất bảo trì và gửi báo cáo khắc phục
    ---
    tags:
      - Maintenance Tickets
    parameters:
      - name: ticket_id
        in: path
        type: string
        required: true
      - in: body
        name: body
        required: false
        schema:
          type: object
          properties:
            notes:
              type: string
              example: Replaced cooling fan module #2 and verified thermal airflow.
    responses:
      200:
        description: Báo cáo khắc phục thành công
    """
    data = request.get_json() or {}
    notes = data.get("notes", "Bảo trì và khắc phục sự cố thành công.")
    try:
        ticket = ticket_service.resolve_ticket(ticket_id, notes)
        ticket_dict = ticket.to_dict()
        _emit_socket("ticket_updated", ticket_dict)
        _emit_socket("ticket_resolved", ticket_dict)
        return success_response(data=ticket_dict, message="Đã hoàn tất khắc phục phiếu bảo trì")
    except Exception as e:
        return error_response(message=str(e), status_code=400)


@ticket_bp.route("/<ticket_id>/close", methods=["POST"])
def close_ticket(ticket_id):
    """
    Operator nghiệm thu và đóng phiếu bảo trì
    ---
    tags:
      - Maintenance Tickets
    parameters:
      - name: ticket_id
        in: path
        type: string
        required: true
    responses:
      200:
        description: Đóng phiếu thành công
    """
    try:
        ticket = ticket_service.close_ticket(ticket_id)
        ticket_dict = ticket.to_dict()
        _emit_socket("ticket_updated", ticket_dict)
        _emit_socket("ticket_closed", ticket_dict)
        return success_response(data=ticket_dict, message="Đã đóng phiếu bảo trì thành công")
    except Exception as e:
        return error_response(message=str(e), status_code=400)


@ticket_bp.route("/<ticket_id>", methods=["DELETE"])
def delete_ticket(ticket_id):
    """
    Xóa phiếu bảo trì
    ---
    tags:
      - Maintenance Tickets
    parameters:
      - name: ticket_id
        in: path
        type: string
        required: true
    responses:
      200:
        description: Xóa thành công
    """
    success = ticket_service.delete(ticket_id)
    if not success:
        return error_response(f"Không tìm thấy phiếu bảo trì: {ticket_id}", status_code=404)
    _emit_socket("ticket_deleted", {"id": ticket_id})
    return success_response(message=f"Đã xóa phiếu bảo trì {ticket_id} thành công")

