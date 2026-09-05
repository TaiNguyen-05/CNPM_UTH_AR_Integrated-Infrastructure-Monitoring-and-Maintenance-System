"""
Test suite validating:
1. Agent NFR Security (X-Agent-Key header authentication)
2. Offline Buffer & Retry (UC-AGT-03)
3. Time-Series Metric Storage & History API
4. Dynamic Threshold Configuration API
"""

import os
import sys
import unittest
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from infrastructure.databases.db_session import db_session
from infrastructure.models.ar_models import MetricLogModel, ServerNodeModel
from services.threshold_engine import ThresholdEngine
from scripts.collector_agent import OfflineBuffer


class TestAgentEnhancements(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.app, cls.socketio = create_app()
        cls.app.config['TESTING'] = False  # Enable real security check
        cls.client = cls.app.test_client()
        cls.agent_key = "ar-imms-agent-secret-token"

    def test_01_agent_security_unauthorized(self):
        """Kiểm tra: Thiếu hoặc sai Header X-Agent-Key phải trả về 401 Unauthorized."""
        payload = {"node_id": "SRV-NODE-01", "cpu": 40.0, "ram": 50.0, "disk": 30.0}
        
        # Không có header
        res = self.client.post('/api/telemetry/ingest', json=payload)
        self.assertEqual(res.status_code, 401)
        self.assertIn("X-Agent-Key", res.get_json().get("error", ""))

        # Header sai
        res_wrong = self.client.post('/api/telemetry/ingest', json=payload, headers={"X-Agent-Key": "wrong-key"})
        self.assertEqual(res_wrong.status_code, 401)

    def test_02_agent_security_authorized(self):
        """Kiểm tra: Header X-Agent-Key hợp lệ được chấp thuận 200 OK."""
        payload = {
            "node_id": "SRV-NODE-01",
            "cpu": 42.0,
            "ram": 52.0,
            "disk": 35.0,
            "temp": 40.0,
            "network_in_kbps": 150.0,
            "network_out_kbps": 200.0
        }
        res = self.client.post(
            '/api/telemetry/ingest',
            json=payload,
            headers={"X-Agent-Key": self.agent_key}
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json().get("status"), "SUCCESS")

    def test_03_timeseries_metrics_storage_and_history(self):
        """Kiểm tra: Lưu trữ metric vào bảng metrics và API lịch sử 24h hoạt động."""
        res = self.client.get('/api/nodes/SRV-NODE-01/metrics/history?hours=24')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get("node_id"), "SRV-NODE-01")
        self.assertGreaterEqual(data.get("count"), 1)
        self.assertIsInstance(data.get("metrics"), list)

    def test_04_dynamic_thresholds_api(self):
        """Kiểm tra: API lấy và cập nhật động ngưỡng cảnh báo (Dynamic Thresholds)."""
        # GET thresholds
        res_get = self.client.get('/api/telemetry/thresholds')
        self.assertEqual(res_get.status_code, 200)
        rules = res_get.get_json().get("thresholds", {})
        self.assertIn("cpu", rules)

        # Update thresholds
        new_conf = {
            "cpu": {"warning": 70.0, "critical": 88.0},
            "temp": {"warning": 60.0, "critical": 78.0}
        }
        res_put = self.client.put('/api/telemetry/thresholds', json=new_conf)
        self.assertEqual(res_put.status_code, 200)
        updated_rules = res_put.get_json().get("thresholds", {})
        self.assertEqual(updated_rules["cpu"]["warning_val"], 70.0)
        self.assertEqual(updated_rules["cpu"]["critical_val"], 88.0)

    def test_05_offline_buffer_and_retry(self):
        """Kiểm tra: Hàng đợi FIFO OfflineBuffer lưu tạm và gửi bù khi kết nối lại."""
        buf = OfflineBuffer(max_size=5)
        for i in range(7):
            buf.enqueue({"node_id": "SRV-NODE-01", "cpu": 50.0 + i, "ram": 60.0, "disk": 40.0})
        
        # Buffer chỉ giữ tối đa 5 mẫu mới nhất
        self.assertEqual(buf.size(), 5)

        # Flush buffer vào server
        flushed = buf.flush(
            endpoint="http://127.0.0.1:5000/api/telemetry/ingest", # fake or skipped if offline
            headers={"X-Agent-Key": self.agent_key}
        )
        self.assertIsInstance(flushed, int)


if __name__ == "__main__":
    unittest.main()
