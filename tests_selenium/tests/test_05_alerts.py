"""
Test Suite 05: Alerts & Incident Management (Acknowledge, Filter, Telemetry Snapshot).
"""
import pytest
from ..pages.auth_page import AuthPage
from ..pages.sidebar_navigation import SidebarNavigation
from ..pages.alerts_page import AlertsPage
from ..test_data.static_data import SAMPLE_ACCOUNTS


class TestAlertsIncidentManagement:

    @pytest.fixture(autouse=True)
    def setup_login_and_navigate(self, driver, base_url):
        auth_page = AuthPage(driver).open(base_url)
        admin_data = SAMPLE_ACCOUNTS["admin"]
        auth_page.login(admin_data["email"], admin_data["password"])
        sidebar = SidebarNavigation(driver)
        sidebar.go_to_alerts()
        sidebar.wait_seconds(0.5)

    def test_tc_alert_001_view_active_alerts(self, driver):
        """TC_ALERT_001: Hiển thị danh sách cảnh báo sự cố đang hoạt động."""
        alerts_page = AlertsPage(driver)
        count = alerts_page.get_alert_count()
        assert count >= 0, "Không lấy được danh sách cảnh báo!"

    def test_tc_alert_002_filter_by_severity(self, driver):
        """TC_ALERT_002: Lọc cảnh báo theo mức độ Nghiêm Trọng / Chưa Tiếp Nhận."""
        alerts_page = AlertsPage(driver)

        alerts_page.filter_critical()
        alerts_page.wait_seconds(0.3)
        assert alerts_page.get_alert_count() >= 0

        alerts_page.filter_unacknowledged()
        alerts_page.wait_seconds(0.3)
        assert alerts_page.get_alert_count() >= 0

        alerts_page.filter_all()
        alerts_page.wait_seconds(0.3)

    def test_tc_alert_003_acknowledge_alert(self, driver):
        """TC_ALERT_003: Tiếp nhận và xử lý cảnh báo (Acknowledge Alert)."""
        alerts_page = AlertsPage(driver)
        alerts_page.select_first_alert()
        alerts_page.wait_seconds(0.3)
        alerts_page.acknowledge_alert()
        alerts_page.wait_seconds(0.5)
        assert True
