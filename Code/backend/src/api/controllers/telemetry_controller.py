import os
import json
import uuid
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from infrastructure.databases.db_session import db_session
from infrastructure.models.ar_models import ServerNodeModel, AlertModel, MaintenanceTicketModel, RackModel, MetricLogModel
from services.threshold_engine import ThresholdEngine

telemetry_bp = Blueprint('telemetry', __name__, url_prefix='/api')

AGENT_SECRET_KEY = os.environ.get("AGENT_SECRET_KEY", "ar-imms-agent-secret-token")


def _verify_agent_auth():
    """Kiểm tra Header bảo mật X-Agent-Key từ Collector Agent (NFR Security)."""
    # Nếu môi trường testing hoặc không cấu hình key thì cho phép
    agent_key = request.headers.get("X-Agent-Key")
    auth_header = request.headers.get("Authorization")
    
    if agent_key and agent_key == AGENT_SECRET_KEY:
        return True
    if auth_header and auth_header.replace("Bearer ", "").strip() == AGENT_SECRET_KEY:
        return True
    
    # Cho phép nếu gửi từ client nội bộ đang test không truyền key
    if current_app.config.get("TESTING") and not agent_key and not auth_header:
        return True
        
    return False


@telemetry_bp.route('/telemetry/ingest', methods=['POST'])
def ingest_telemetry():
    """
    Endpoint tiếp nhận dữ liệu Telemetry từ Collector Agent hoặc Simulator.
    Yêu cầu Header X-Agent-Key để bảo vệ an ninh hạ tầng (NFR Security).
    """
    if not _verify_agent_auth():
        return jsonify({
            "error": "Unauthorized: Missing or invalid 'X-Agent-Key' header",
            "required_header": "X-Agent-Key"
        }), 401

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
        cpu_val = float(data.get("cpu", 0.0))
        ram_val = float(data.get("ram", 0.0))
        disk_val = float(data.get("disk", 0.0))
        temp_val = float(data.get("temp", 35.0))
        net_in = float(data.get("network_in_kbps", data.get("netIn", 0.0)))
        net_out = float(data.get("network_out_kbps", data.get("netOut", 0.0)))

        telemetry_payload = {
            "node_id": node_id,
            "node_name": node.name,
            "rack_id": rack_id,
            "cpu": cpu_val,
            "ram": ram_val,
            "disk": disk_val,
            "temp": temp_val,
            "network_in_kbps": net_in,
            "network_out_kbps": net_out,
            "containers": data.get("containers", []),
            "timestamp": datetime.utcnow().isoformat()
        }

        # 1. Lưu trữ Time-series Metric Log vào database Supabase
        metric_log = MetricLogModel(
            id=f"MET-{uuid.uuid4().hex[:10].upper()}",
            server_node_id=node_id,
            cpu=cpu_val,
            ram=ram_val,
            disk=disk_val,
            temp=temp_val,
            network_in_kbps=net_in,
            network_out_kbps=net_out,
            timestamp=datetime.utcnow()
        )
        session.add(metric_log)
        session.commit()

        # 2. Đánh giá ngưỡng vi phạm và tự động sinh Alert/Ticket nếu cần (Tái sử dụng session & node)
        socketio = getattr(current_app, 'socketio', None)
        result = ThresholdEngine.evaluate_node_telemetry(
            node_id, 
            telemetry_payload, 
            socketio=socketio, 
            session=session, 
            node=node
        )

        # 3. Phát sóng real-time telemetry stream qua Flask-SocketIO
        if socketio:
            socketio.emit("telemetry_stream", telemetry_payload, to=f"node:{node_id}")
            socketio.emit("telemetry_stream", telemetry_payload, to=f"rack:{rack_id}")
            socketio.emit("telemetry_stream", telemetry_payload, to="dashboard")
            socketio.emit("telemetry_stream", telemetry_payload)

        return jsonify({
            "status": "SUCCESS",
            "message": "Telemetry received, stored, and processed successfully",
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


@telemetry_bp.route('/nodes/<node_id>/metrics/history', methods=['GET'])
def get_node_metrics_history(node_id):
    """
    Truy vấn lịch sử telemetry của một node (mặc định 24h gần nhất) phục vụ vẽ biểu đồ Dashboard.
    """
    hours = request.args.get('hours', default=24, type=int)
    limit = request.args.get('limit', default=100, type=int)
    since_time = datetime.utcnow() - timedelta(hours=hours)

    session = db_session()
    try:
        logs = (
            session.query(MetricLogModel)
            .filter(
                MetricLogModel.server_node_id == node_id,
                MetricLogModel.timestamp >= since_time
            )
            .order_by(MetricLogModel.timestamp.asc())
            .limit(limit)
            .all()
        )

        history_data = [
            {
                "id": m.id,
                "cpu": m.cpu,
                "ram": m.ram,
                "disk": m.disk,
                "temp": m.temp,
                "network_in_kbps": m.network_in_kbps,
                "network_out_kbps": m.network_out_kbps,
                "timestamp": m.timestamp.isoformat()
            }
            for m in logs
        ]

        return jsonify({
            "node_id": node_id,
            "hours": hours,
            "count": len(history_data),
            "metrics": history_data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()


@telemetry_bp.route('/telemetry/thresholds', methods=['GET'])
def get_thresholds():
    """Lấy danh sách cấu hình ngưỡng cảnh báo hiện hành."""
    rules = ThresholdEngine.get_rules()
    return jsonify({
        "status": "SUCCESS",
        "thresholds": rules
    }), 200


@telemetry_bp.route('/telemetry/thresholds', methods=['POST', 'PUT'])
def update_thresholds():
    """
    Cập nhật động ngưỡng cảnh báo (Dynamic Thresholds) từ Web Admin/Operator.
    Body ví dụ:
    {
      "cpu": {"warning": 80.0, "critical": 95.0},
      "temp": {"warning": 70.0, "critical": 85.0}
    }
    """
    data = request.get_json() or {}
    if not data:
        return jsonify({"error": "Missing JSON body with threshold rules"}), 400

    updated = ThresholdEngine.set_rules(data)
    return jsonify({
        "status": "SUCCESS",
        "message": "Threshold rules updated successfully",
        "thresholds": updated
    }), 200


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
