# src/api/responses.py
from flask import jsonify


def success_response(data=None, message="Success", status_code=200):
    payload = {"success": True, "message": message}
    if data is not None:
        payload["data"] = data
    return jsonify(payload), status_code


def error_response(message="An error occurred", status_code=400, errors=None):
    payload = {"success": False, "message": message}
    if errors is not None:
        payload["errors"] = errors
    return jsonify(payload), status_code


def not_found_response(message="Resource not found"):
    return jsonify({"success": False, "message": message}), 404


def validation_error_response(errors):
    return jsonify({"success": False, "message": "Validation errors", "errors": errors}), 422