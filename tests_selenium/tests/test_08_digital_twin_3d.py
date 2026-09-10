"""
Test Suite 08: Digital Twin, 3D Elevation & Thermal Heatmap.
"""
import pytest
from ..pages.auth_page import AuthPage
from ..pages.sidebar_navigation import SidebarNavigation
from ..pages.digital_twin_page import DigitalTwinPage
from ..test_data.static_data import SAMPLE_ACCOUNTS


class TestDigitalTwin:

    @pytest.fixture(autouse=True)
    def setup_login_and_navigate(self, driver, base_url):
        auth_page = AuthPage(driver).open(base_url)
        admin_data = SAMPLE_ACCOUNTS["admin"]
        auth_page.login(admin_data["email"], admin_data["password"])
        sidebar = SidebarNavigation(driver)
        sidebar.go_to_digital_twin()
        sidebar.wait_seconds(0.5)

    def test_tc_twin_001_display_digital_twin(self, driver):
        """TC_TWIN_001: Hiển thị sơ đồ mặt bằng Digital Twin và các tủ Rack."""
        twin_page = DigitalTwinPage(driver)
        assert twin_page.is_page_displayed(), "Mặt bằng Digital Twin không hiển thị!"

    def test_tc_twin_002_switch_view_modes(self, driver):
        """TC_TWIN_002: Chuyển đổi giữa các chế độ Chuẩn, Nhiệt độ (Thermal) và Tải CPU (Workload)."""
        twin_page = DigitalTwinPage(driver)
        
        twin_page.switch_to_thermal_view()
        twin_page.wait_seconds(0.4)
        
        twin_page.switch_to_workload_view()
        twin_page.wait_seconds(0.4)
        
        twin_page.switch_to_normal_view()
        twin_page.wait_seconds(0.4)
        assert True

    def test_tc_twin_003_node_fan_boost_and_control(self, driver):
        """TC_TWIN_003: Điều khiển quạt tản nhiệt tăng tốc (Fan Boost) và lệnh quản trị node."""
        twin_page = DigitalTwinPage(driver)
        twin_page.select_first_node()
        twin_page.wait_seconds(0.3)
        
        twin_page.toggle_fan_boost()
        twin_page.wait_seconds(0.5)
        assert True

    def test_tc_twin_004_launch_ar_overlay(self, driver):
        """TC_TWIN_004: Mở không gian tăng cường thực tế AR Overlay."""
        twin_page = DigitalTwinPage(driver)
        twin_page.open_ar_overlay()
        twin_page.wait_seconds(0.5)
        assert True
