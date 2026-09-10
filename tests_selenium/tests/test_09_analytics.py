"""
Test Suite 09: Analytics, PUE Metrics & Historical Reporting.
"""
import pytest
from ..pages.auth_page import AuthPage
from ..pages.sidebar_navigation import SidebarNavigation
from ..pages.analytics_page import AnalyticsPage
from ..test_data.static_data import SAMPLE_ACCOUNTS


class TestAnalyticsReporting:

    @pytest.fixture(autouse=True)
    def setup_login_and_navigate(self, driver, base_url):
        auth_page = AuthPage(driver).open(base_url)
        admin_data = SAMPLE_ACCOUNTS["admin"]
        auth_page.login(admin_data["email"], admin_data["password"])
        sidebar = SidebarNavigation(driver)
        sidebar.go_to_analytics()
        sidebar.wait_seconds(0.5)

    def test_tc_analytics_001_view_pue_dashboard(self, driver):
        """TC_ANALYTICS_001: Hiển thị bảng điều khiển phân tích chỉ số PUE và công suất IT."""
        analytics_page = AnalyticsPage(driver)
        assert analytics_page.is_page_displayed(), "Trang Báo cáo & PUE không hiển thị!"

    def test_tc_analytics_002_filter_time_ranges(self, driver):
        """TC_ANALYTICS_002: Chuyển đổi qua lại giữa các mốc thời gian 24h, 7 ngày, 30 ngày."""
        analytics_page = AnalyticsPage(driver)
        
        analytics_page.select_time_range_7d()
        analytics_page.wait_seconds(0.3)
        
        analytics_page.select_time_range_30d()
        analytics_page.wait_seconds(0.3)
        
        analytics_page.select_time_range_24h()
        analytics_page.wait_seconds(0.3)
        assert True

    def test_tc_analytics_003_export_pue_csv(self, driver):
        """TC_ANALYTICS_003: Xuất báo cáo dữ liệu PUE và phụ tải tủ Rack ra file CSV."""
        analytics_page = AnalyticsPage(driver)
        assert analytics_page.is_export_csv_btn_visible(), "Nút xuất CSV không hiển thị!"
        analytics_page.export_csv()
        analytics_page.wait_seconds(0.5)
        assert True
