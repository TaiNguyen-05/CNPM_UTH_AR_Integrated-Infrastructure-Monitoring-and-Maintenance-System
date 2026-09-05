"""
Automated Integration Test Suite for AR-IMMS Telemetry Streaming, Threshold Engine & Watchdog
"""

import os
import sys
import time
import json
from datetime import datetime, timedelta

# Add backend src to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from infrastructure.databases.db_session import db_session
from infrastructure.models.ar_models import ServerNodeModel, AlertModel, MaintenanceTicketModel
from services.threshold_engine import ThresholdEngine
from services.watchdog_service import HeartbeatWatchdog


def run_tests():
    print("==================================================================")
    print("🧪 AR-IMMS TELEMETRY & THRESHOLD INTEGRATION TESTS")
    print("==================================================================")

    app, socketio = create_app()
    app.testing = True
    client = app.test_client()

    # Clean previous open alerts on SRV-NODE-01 for clean test run
    session = db_session()
    try:
        session.query(AlertModel).filter(
            AlertModel.server_node_id == "SRV-NODE-01",
            AlertModel.status == "OPEN"
        ).update({"status": "RESOLVED"})
        session.commit()
    finally:
        session.close()

    # Test 1: Health Check Endpoint
    print("\n[Test 1] Testing /api/health Endpoint...")
    res = client.get('/api/health')
    assert res.status_code == 200, f"Health check failed with {res.status_code}"
    health_data = res.get_json()
    assert health_data.get("status") == "ONLINE"
    assert "Flask-SocketIO" in health_data.get("realtime_engine", "")
    print(f"✅ PASS: Health check OK (Real-time engine: {health_data.get('realtime_engine')})")

    # Test 2: Normal Telemetry Ingestion (Healthy)
    print("\n[Test 2] Testing Normal Telemetry Ingestion (CPU 45%, RAM 55%, Temp 42°C)...")
    payload_normal = {
        "node_id": "SRV-NODE-01",
        "cpu": 45.0,
        "ram": 55.0,
        "disk": 40.0,
        "temp": 42.0,
        "network_in_kbps": 120.5,
        "network_out_kbps": 85.0,
        "containers": [
            {"name": "test-container-1", "image": "nginx:alpine", "cpu": "2.1%", "ram": "128MB", "status": "RUNNING"}
        ]
    }
    res = client.post('/api/telemetry/ingest', json=payload_normal)
    assert res.status_code == 200
    res_json = res.get_json()
    eval_res = res_json.get("evaluation", {})
    assert eval_res.get("node_status") == "HEALTHY"
    print(f"✅ PASS: Normal telemetry ingested. Node status: {eval_res.get('node_status')}")

    # Test 3: Critical Telemetry Ingestion (Spike CPU 96% -> Auto Alert & Ticket)
    print("\n[Test 3] Testing Critical CPU Spike (96% >= 90% threshold)...")
    payload_spike = {
        "node_id": "SRV-NODE-01",
        "cpu": 96.0,
        "ram": 60.0,
        "disk": 40.0,
        "temp": 75.0,
        "network_in_kbps": 500.0,
        "network_out_kbps": 600.0,
        "containers": [
            {"name": "load-generator", "image": "stress:latest", "cpu": "85.0%", "ram": "4GB", "status": "HIGH_LOAD"}
        ]
    }
    res = client.post('/api/telemetry/ingest', json=payload_spike)
    assert res.status_code == 200
    eval_res = res.get_json().get("evaluation", {})
    assert eval_res.get("node_status") == "CRITICAL"
    assert eval_res.get("alerts_created") >= 1
    assert eval_res.get("tickets_created") >= 1
    print(f"✅ PASS: Critical breach triggered! Node: {eval_res.get('node_status')}, Alerts created: {eval_res.get('alerts_created')}, Tickets created: {eval_res.get('tickets_created')}")

    # Test 4: Anti-spam De-duplication Check
    print("\n[Test 4] Testing Anti-Spam De-duplication (Sending another 96% CPU spike)...")
    res2 = client.post('/api/telemetry/ingest', json=payload_spike)
    assert res2.status_code == 200
    eval_res2 = res2.get_json().get("evaluation", {})
    assert eval_res2.get("alerts_created") == 0, "Spam duplicate alert was created!"
    assert eval_res2.get("tickets_created") == 0, "Spam duplicate ticket was created!"
    print("✅ PASS: De-duplication verified. No duplicate open alerts/tickets created.")

    # Test 5: Watchdog Stale Node Offline Detection (>90s)
    print("\n[Test 5] Testing Watchdog Stale Node Detection (>90s)...")
    session = db_session()
    try:
        # Simulate node 03 last heartbeat 100 seconds ago
        node3 = session.query(ServerNodeModel).filter(ServerNodeModel.id == "SRV-NODE-03").first()
        if node3:
            node3.last_heartbeat_at = datetime.utcnow() - timedelta(seconds=100)
            node3.status = "HEALTHY"
            session.commit()

        # Run watchdog check
        watchdog = HeartbeatWatchdog(socketio=socketio, timeout_seconds=90, check_interval=10)
        watchdog.check_stale_nodes()

        # Verify node 03 status changed to OFFLINE
        node3_updated = session.query(ServerNodeModel).filter(ServerNodeModel.id == "SRV-NODE-03").first()
        assert node3_updated.status == "OFFLINE", f"Expected OFFLINE, got {node3_updated.status}"
        print(f"✅ PASS: Watchdog detected stale node. Node 03 status updated to: {node3_updated.status}")
    finally:
        session.close()

    # Test 6: Telemetry Summary API
    print("\n[Test 6] Testing /api/telemetry/summary API...")
    res_summary = client.get('/api/telemetry/summary')
    assert res_summary.status_code == 200
    summary_data = res_summary.get_json()
    print(f"✅ PASS: Summary API returned: Total Nodes={summary_data.get('total_nodes')}, Offline={summary_data.get('offline_nodes')}, Open Alerts={summary_data.get('open_alerts_count')}, Active Tickets={summary_data.get('active_tickets_count')}")

    print("\n==================================================================")
    print("🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("==================================================================")


if __name__ == "__main__":
    run_tests()
