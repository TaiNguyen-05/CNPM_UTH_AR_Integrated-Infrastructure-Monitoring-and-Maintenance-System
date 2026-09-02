from flask import Blueprint, request
from marshmallow import ValidationError
from infrastructure.repositories.ar_repositories import AlertRepository
from services.ar_services import AlertService
from api.schemas.ar_schemas import AlertSchema
from api.responses import success_response, error_response

alert_bp = Blueprint("alerts", __name__, url_prefix="/api/alerts")

alert_repo = AlertRepository()
alert_service = AlertService(alert_repo)
alert_schema = AlertSchema()


@alert_bp.route("", methods=["GET"])
def list_alerts():
    """
    Lấy danh sách tất cả các cảnh báo sự cố (có thể lọc theo active hoặc node_id)
    ---
    tags:
      - Alerts & Incidents
    parameters:
      - name: active_only
        in: query
        type: boolean
        required: false
        description: Chỉ lấy các cảnh báo đang mở (OPEN, ACKNOWLEDGED)
      - name: node_id
        in: query
        type: string
        required: false
        description: Lọc theo Server Node ID
    responses:
      200:
        description: Danh sách Cảnh báo
    """
    active_only = request.args.get("active_only", "").lower() in ["true", "1"]
    node_id = request.args.get("node_id")

    if active_only:
        alerts = alert_service.list_active()
    elif node_id:
        alerts = alert_service.list_by_node(node_id)
    else:
        alerts = alert_service.list_all()

    return success_response(data=[a.to_dict() for a in alerts])


@alert_bp.route("/<alert_id>", methods=["GET"])
def get_alert(alert_id):
    """
    Lấy thông tin chi tiết một cảnh báo theo ID
    ---
    tags:
      - Alerts & Incidents
    parameters:
      - name: alert_id
        in: path
        type: string
        required: true
    responses:
      200:
        description: Chi tiết cảnh báo
      404:
        description: Không tìm thấy
    """
    alert = alert_service.get_by_id(alert_id)
    if not alert:
        return error_response(f"Không tìm thấy cảnh báo: {alert_id}", status_code=404)
    return success_response(data=alert.to_dict())


@alert_bp.route("", methods=["POST"])
def create_alert():
    """
    Tạo mới một cảnh báo sự cố
    ---
    tags:
      - Alerts & Incidents
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - server_node_id
            - title
            - message
          properties:
            server_node_id:
              type: string
              example: SRV-NODE-01
            title:
              type: string
              example: Memory Consumption Threshold > 90%
            message:
              type: string
              example: Memory pool exhausted by worker process.
            severity:
              type: string
              example: CRITICAL
            metric_name:
              type: string
              example: ram
            metric_value:
              type: number
              example: 92.4
            threshold_value:
              type: number
              example: 90.0
    responses:
      201:
        description: Tạo mới cảnh báo thành công
    """
    data = request.get_json() or {}
    try:
        validated_data = alert_schema.load(data)
    except ValidationError as err:
        return error_response(message="Dữ liệu không hợp lệ", errors=err.messages, status_code=400)

    try:
        new_alert = alert_service.create_alert(validated_data)
        return success_response(data=new_alert.to_dict(), message="Tạo mới cảnh báo thành công", status_code=201)
    except Exception as e:
        return error_response(message=str(e), status_code=400)


@alert_bp.route("/<alert_id>/acknowledge", methods=["POST"])
def acknowledge_alert(alert_id):
    """
    Tiếp nhận / Xác nhận cảnh báo (Acknowledge)
    ---
    tags:
      - Alerts & Incidents
    parameters:
      - name: alert_id
        in: path
        type: string
        required: true
      - in: body
        name: body
        required: false
        schema:
          type: object
          properties:
            user_id:
              type: string
              example: USR-002
    responses:
      200:
        description: Xác nhận thành công
    """
    data = request.get_json() or {}
    user_id = data.get("user_id", "OPERATOR")
    try:
        alert = alert_service.acknowledge_alert(alert_id, user_id)
        return success_response(data=alert.to_dict(), message="Đã tiếp nhận cảnh báo")
    except Exception as e:
        return error_response(message=str(e), status_code=400)


@alert_bp.route("/<alert_id>/resolve", methods=["POST"])
def resolve_alert(alert_id):
    """
    Đánh dấu cảnh báo đã được giải quyết xong (Resolve)
    ---
    tags:
      - Alerts & Incidents
    parameters:
      - name: alert_id
        in: path
        type: string
        required: true
      - in: body
        name: body
        required: false
        schema:
          type: object
          properties:
            user_id:
              type: string
              example: USR-002
    responses:
      200:
        description: Giải quyết thành công
    """
    data = request.get_json() or {}
    user_id = data.get("user_id", "OPERATOR")
    try:
        alert = alert_service.resolve_alert(alert_id, user_id)
        return success_response(data=alert.to_dict(), message="Đã giải quyết cảnh báo thành công")
    except Exception as e:
        return error_response(message=str(e), status_code=400)


@alert_bp.route("/<alert_id>", methods=["DELETE"])
def delete_alert(alert_id):
    """
    Xóa cảnh báo khỏi hệ thống
    ---
    tags:
      - Alerts & Incidents
    parameters:
      - name: alert_id
        in: path
        type: string
        required: true
    responses:
      200:
        description: Xóa thành công
    """
    success = alert_service.delete(alert_id)
    if not success:
        return error_response(f"Không tìm thấy cảnh báo: {alert_id}", status_code=404)
    return success_response(message=f"Đã xóa cảnh báo {alert_id} thành công")
