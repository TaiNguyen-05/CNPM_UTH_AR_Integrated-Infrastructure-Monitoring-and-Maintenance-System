import os
from flask import Flask, jsonify, send_from_directory
from flasgger import Swagger
from flask_cors import CORS
from api.controllers.node_controller import node_bp
from api.controllers.rack_controller import rack_bp
from api.controllers.alert_controller import alert_bp
from api.controllers.ticket_controller import ticket_bp
from api.controllers.user_controller import user_bp
from api.middleware import middleware
from infrastructure.databases.db_session import init_ar_database
from dependency_container import Container


def create_app():
    # Khởi tạo DI Container
    container = Container()

    # Đường dẫn thư mục frontend đã build (frontend/dist)
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist'))

    app = Flask(__name__, static_folder=base_dir, static_url_path='')
    app.container = container
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Swagger Configuration
    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": "apispec",
                "route": "/apispec.json",
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/docs"
    }

    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "AR-IMMS RESTful API & OOP Clean Architecture",
            "description": (
                "Backend API cho Hệ thống Giám sát và Bảo trì Cơ sở Hạ tầng Tích hợp Thực tế Tăng cường (AR-IMMS).\n\n"
                "Kiến trúc tuân thủ 4 trụ cột OOP (Đóng gói, Trừu tượng hóa, Kế thừa, Đa hình) và cung cấp đầy đủ chức năng CRUD "
                "cho Server Nodes, Racks, Alerts, Maintenance Tickets và Users."
            ),
            "version": "2.0.0",
            "contact": {
                "name": "AR-IMMS Engineering Team",
                "url": "http://localhost:9999"
            }
        },
        "basePath": "/",
        "schemes": ["http", "https"],
        "tags": [
            {"name": "Server Nodes", "description": "CRUD máy chủ vật lý, đo đạc telemetry và nhận diện QR AR"},
            {"name": "Racks", "description": "CRUD tủ rack trung tâm dữ liệu"},
            {"name": "Alerts & Incidents", "description": "CRUD cảnh báo sự cố, tiếp nhận (Acknowledge) và giải quyết (Resolve)"},
            {"name": "Maintenance Tickets", "description": "CRUD phiếu bảo trì, phân công kỹ thuật viên và ghi log AR"},
            {"name": "Users & Access Control", "description": "CRUD tài khoản người dùng, RBAC và phê duyệt tài khoản"}
        ]
    }

    Swagger(app, config=swagger_config, template=swagger_template)

    # Đăng ký Blueprints CRUD
    app.register_blueprint(node_bp)
    app.register_blueprint(rack_bp)
    app.register_blueprint(alert_bp)
    app.register_blueprint(ticket_bp)
    app.register_blueprint(user_bp)

    # Khởi tạo Cơ sở dữ liệu và seed data
    try:
        init_ar_database(app)
    except Exception as e:
        print(f"[App] Lỗi khởi tạo DB: {e}")

    # Đăng ký Middleware xử lý log và CORS
    middleware(app)

    # Web Frontend & SPA Dashboard Routes
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path.startswith('api') or path.startswith('docs') or path.startswith('flasgger_static') or path == 'apispec.json':
            return jsonify({'error': 'Not found'}), 404
        file_path = os.path.join(base_dir, path)
        if path != "" and os.path.exists(file_path) and os.path.isfile(file_path):
            return send_from_directory(base_dir, path)
        return send_from_directory(base_dir, 'index.html')

    @app.route("/api/health")
    def health_check():
        return jsonify({
            "status": "ONLINE",
            "system": "AR-IMMS Backend Command Center",
            "architecture": "Clean Architecture & Full OOP (4 Pillars)",
            "version": "2.0.0"
        })

    return app


if __name__ == '__main__':
    app = create_app()
    print("==================================================================")
    print("🚀 AR-IMMS Central Command Center: http://localhost:9999/")
    print("📖 Swagger API Documentation:     http://localhost:9999/docs")
    print("🩺 Health Check Endpoint:         http://localhost:9999/api/health")
    print("==================================================================")
    app.run(host='0.0.0.0', port=9999, debug=True)