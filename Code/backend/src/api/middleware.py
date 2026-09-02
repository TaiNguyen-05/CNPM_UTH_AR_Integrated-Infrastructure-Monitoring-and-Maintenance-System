# Middleware functions for processing requests and responses
from flask import request, jsonify
from werkzeug.exceptions import HTTPException


def log_request_info(app):
    app.logger.debug('Request: %s %s', request.method, request.path)


def add_custom_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response


def middleware(app):
    @app.before_request
    def before_request():
        if request.method == 'OPTIONS':
            return jsonify({'message': 'CORS OK'}), 200
        log_request_info(app)

    @app.after_request
    def after_request(response):
        return add_custom_headers(response)

    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        return jsonify({'success': False, 'error': e.description, 'code': e.code}), e.code

    @app.errorhandler(Exception)
    def handle_generic_exception(e):
        app.logger.error('Unhandled Exception: %s', str(e))
        return jsonify({'success': False, 'error': str(e)}), 500