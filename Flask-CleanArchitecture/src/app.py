import os
from flask import Flask, jsonify, send_from_directory
from api.swagger import spec
from api.controllers.todo_controller import bp as todo_bp
from api.controllers.auth_controller import auth_bp as auth_bp
from api.middleware import middleware
from api.responses import success_response
from infrastructure.databases import init_db
from config import Config, SwaggerConfig
from flasgger import Swagger
from flask_swagger_ui import get_swaggerui_blueprint


def create_app():
    # Resolve web-admin directory path relative to workspace
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'web-admin'))
    
    app = Flask(__name__, static_folder=base_dir, static_url_path='/static')
    Swagger(app)
    
    # Register API Blueprints
    app.register_blueprint(todo_bp)
    app.register_blueprint(auth_bp)

    # Swagger UI Blueprint
    SWAGGER_URL = '/docs'
    API_URL = '/swagger.json'
    swaggerui_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={'app_name': "AR-IMMS Backend API"}
    )
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

    try:
        init_db(app)
    except Exception as e:
        print(f"Error initializing database: {e}")

    # Register middleware
    middleware(app)

    # Web Admin Dashboard Routes
    @app.route('/')
    @app.route('/admin')
    def serve_admin():
        return send_from_directory(base_dir, 'index.html')

    @app.route('/<path:filename>')
    def serve_admin_assets(filename):
        if os.path.exists(os.path.join(base_dir, filename)):
            return send_from_directory(base_dir, filename)
        return jsonify({'error': 'Not found'}), 404

    @app.route("/swagger.json")
    def swagger_json():
        return jsonify(spec.to_dict())

    return app


if __name__ == '__main__':
    app = create_app()
    print("AR-IMMS Central Command Center running at: http://localhost:9999/")
    print("Swagger API Documentation running at:     http://localhost:9999/docs")
    app.run(host='0.0.0.0', port=9999, debug=True)