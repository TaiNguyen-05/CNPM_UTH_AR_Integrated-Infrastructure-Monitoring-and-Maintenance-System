"""
Test Suite 02: Navigation & Multi-Tab Routing.
"""
import pytest
from ..pages.auth_page import AuthPage
from ..pages.sidebar_navigation import SidebarNavigation
from ..pages.header_page import HeaderPage
from ..pages.assets_page import AssetsPage
from ..pages.alerts_page import AlertsPage
from ..pages.users_page import UsersPage
from ..pages.audit_logs_page import AuditLogsPage
from ..pages.telemetry_page import TelemetryPage
from ..test_data.static_data import SAMPLE_ACCOUNTS


class TestNavigation:

    @pytest.fixture(autouse=True)
    def setup_login(self, driver, base_url):
        """Precondition: Login as Admin to access all views."""
        auth_page = AuthPage(driver).open(base_url)
        admin_data = SAMPLE_ACCOUNTS["admin"]
        auth_page.login(admin_data["email"], admin_data["password"])
        header_page = HeaderPage(driver)
        assert header_page.is_header_visible()

    def test_tc_nav_001_switch_tabs_smoothly(self, driver):
        """TC_NAV_001: Điều hướng qua lại giữa tất cả các phân hệ chức năng."""
        sidebar = SidebarNavigation(driver)

        # Tab Assets
        sidebar.go_to_assets()
        sidebar.wait_seconds(0.5)

        # Tab Alerts
        sidebar.go_to_alerts()
        alerts_page = AlertsPage(driver)
        assert alerts_page.get_alert_count() >= 0
        sidebar.wait_seconds(0.4)

        # Tab Users
        sidebar.go_to_users()
        users_page = UsersPage(driver)
        assert users_page.is_page_displayed()
        sidebar.wait_seconds(0.4)

        # Tab Audit Logs
        sidebar.go_to_audit_logs()
        audit_page = AuditLogsPage(driver)
        assert audit_page.is_page_displayed()
        sidebar.wait_seconds(0.4)

        # Tab Telemetry
        sidebar.go_to_telemetry()
        telemetry_page = TelemetryPage(driver)
        assert telemetry_page.is_stream_button_visible()

    def test_tc_nav_002_header_notifications_and_profile(self, driver):
        """TC_NAV_002: Kiểm tra popover Cảnh báo sự cố và Menu người dùng trên Header."""
        header_page = HeaderPage(driver)

        # Notifications
        header_page.open_notifications()
        assert header_page.is_notifications_popover_open()

        # Close notifications by clicking outside or reopening profile
        header_page.open_profile_menu()
        assert header_page.is_profile_menu_open()
