import json
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from infrastructure.databases.db_session import db_session
from infrastructure.models.ar_models import ServerNodeModel, AlertModel, MaintenanceTicketModel, RackModel
from services.threshold_engine import ThresholdEngine

telemetry_bp = Blueprint('telemetry', __name__, url_prefix='/api')


@telemetry_bp.route('/telemetry/ingest', methods=['POST'])
def ingest_telemetry():
    """
    Endpoint tiếp nhận dữ liệu Telemetry từ Collector Agent hoặc Simulator.
    ---
    tags:
      - Telemetry Ingestion & Stream
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - node_id
            - cpu
            - ram
            - disk
          properties:
            node_id:
              type: string
              example: SRV-NODE-01
            cpu:
              type: number
              example: 45.2
            ram:
              type: number
              example: 62.5
            disk:
              type: number
              example: 38.0
            temp:
              type: number
              example: 41.5
            network_in_kbps:
              type: number
              example: 128.4
            network_out_kbps:
              type: number
              example: 345.1
            containers:
              type: array
              items:
                type: object
    responses:
      200:
        description: Dữ liệu Telemetry được tiếp nhận và xử lý thành công.
    """
    data = request.get_json() or {}
    node_id = data.get('node_id') or data.get('id')
    if not node_id:
        return jsonify({'error': 'Missing required field: node_id'}), 400

    session = db_session()
    try:
        node = session.query(ServerNodeModel).filter(ServerNodeModel.id == node_id).first()
        if not node:
            return jsonify({'error': f'Server Node with ID {node_id} does not exist'}), 404

        rack_id = node.rack_id
        telemetry_payload = {
            "node_id": node_id,
            "node_name": node.name,
            "rack_id": rack_id,
            "cpu": float(data.get("cpu", 0.0)),
            "ram": float(data.get("ram", 0.0)),
            "disk": float(data.get("disk", 0.0)),
            "temp": float(data.get("temp", 35.0)),
            "network_in_kbps": float(data.get("network_in_kbps", data.get("netIn", 0.0))),
            "network_out_kbps": float(data.get("network_out_kbps", data.get("netOut", 0.0))),
            "containers": data.get("containers", []),
            "timestamp": datetime.utcnow().isoformat()
        }

        # Đánh giá ngưỡng vi phạm và tự động sinh Alert/Ticket nếu cần
        socketio = getattr(current_app, 'socketio', None)
        result = ThresholdEngine.evaluate_node_telemetry(node_id, telemetry_payload, socketio=socketio)

        # Phát sóng real-time telemetry stream qua Flask-SocketIO
        if socketio:
            # 1. Phát cho room của node cụ thể
            socketio.emit("telemetry_stream", telemetry_payload, to=f"node:{node_id}")
            # 2. Phát cho room của rack
            socketio.emit("telemetry_stream", telemetry_payload, to=f"rack:{rack_id}")
            # 3. Phát cho toàn bộ dashboard
            socketio.emit("telemetry_stream", telemetry_payload, to="dashboard")
            # 4. Broadcast chung cho các client kết nối thông thường
            socketio.emit("telemetry_stream", telemetry_payload)

        return jsonify({
            "status": "SUCCESS",
            "message": "Telemetry received and processed successfully",
            "evaluation": result
        }), 200

    except Exception as e:
        session.rollback()
        return jsonify({"error": f"Failed to ingest telemetry: {str(e)}"}), 500
    finally:
        session.close()


@telemetry_bp.route('/nodes/<node_id>/telemetry', methods=['POST'])
def ingest_node_telemetry(node_id):
    """Alias endpoint nhận telemetry trực tiếp theo URL node_id."""
    data = request.get_json() or {}
    data['node_id'] = node_id
    request._cached_json = (data, data)
    return ingest_telemetry()


@telemetry_bp.route('/telemetry/summary', methods=['GET'])
def get_system_summary():
    """
    Trả về tổng quan thống kê trạng thái node, cảnh báo và vé bảo trì cho Web Admin.
    """
    session = db_session()
    try:
        nodes = session.query(ServerNodeModel).all()
        open_alerts = session.query(AlertModel).filter(AlertModel.status.in_(["OPEN", "ACKNOWLEDGED"])).all()
        active_tickets = session.query(MaintenanceTicketModel).filter(
            MaintenanceTicketModel.status.in_(["CREATED", "ASSIGNED", "IN_PROGRESS", "PENDING_PARTS"])
        ).all()

        healthy_count = sum(1 for n in nodes if n.status == "HEALTHY")
        warning_count = sum(1 for n in nodes if n.status == "WARNING")
        critical_count = sum(1 for n in nodes if n.status == "CRITICAL")
        offline_count = sum(1 for n in nodes if n.status == "OFFLINE")

        return jsonify({
            "total_nodes": len(nodes),
            "healthy_nodes": healthy_count,
            "warning_nodes": warning_count,
            "critical_nodes": critical_count,
            "offline_nodes": offline_count,
            "open_alerts_count": len(open_alerts),
            "active_tickets_count": len(active_tickets),
            "timestamp": datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()
