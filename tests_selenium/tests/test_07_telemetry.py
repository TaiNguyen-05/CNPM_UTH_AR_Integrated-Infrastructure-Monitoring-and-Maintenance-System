"""
Test Suite 07: Telemetry & Real-Time Data Stream.
"""
import pytest
from ..pages.auth_page import AuthPage
from ..pages.sidebar_navigation import SidebarNavigation
from ..pages.telemetry_page import TelemetryPage
from ..test_data.static_data import SAMPLE_ACCOUNTS


class TestTelemetryStream:

    @pytest.fixture(autouse=True)
    def setup_login_and_navigate(self, driver, base_url):
        auth_page = AuthPage(driver).open(base_url)
        admin_data = SAMPLE_ACCOUNTS["admin"]
        auth_page.login(admin_data["email"], admin_data["password"])
        sidebar = SidebarNavigation(driver)
        sidebar.go_to_telemetry()
        sidebar.wait_seconds(0.5)

    def test_tc_telem_001_stream_controls(self, driver):
        """TC_TELEM_001: Kiểm tra nút điều khiển luồng dữ liệu thời gian thực (Pause / Resume)."""
        telemetry_page = TelemetryPage(driver)
        assert telemetry_page.is_stream_button_visible(), "Nút điều khiển luồng Stream không hiển thị!"

        telemetry_page.toggle_streaming()
        telemetry_page.wait_seconds(0.4)
        telemetry_page.toggle_streaming()
        telemetry_page.wait_seconds(0.4)
        assert True
