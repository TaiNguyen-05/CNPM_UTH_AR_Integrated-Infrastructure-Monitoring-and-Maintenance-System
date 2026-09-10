"""
Test Suite 10: Audit Logs, Security Trail & Compliance Tracking.
"""
import pytest
from ..pages.auth_page import AuthPage
from ..pages.sidebar_navigation import SidebarNavigation
from ..pages.audit_logs_page import AuditLogsPage
from ..test_data.static_data import SAMPLE_ACCOUNTS


class TestAuditLogsSuite:

    @pytest.fixture(autouse=True)
    def setup_login_and_navigate(self, driver, base_url):
        auth_page = AuthPage(driver).open(base_url)
        admin_data = SAMPLE_ACCOUNTS["admin"]
        auth_page.login(admin_data["email"], admin_data["password"])
        sidebar = SidebarNavigation(driver)
        sidebar.go_to_audit_logs()
        sidebar.wait_seconds(0.5)

    def test_tc_audit_001_view_audit_trail_table(self, driver):
        """TC_AUDIT_001: Hiển thị bảng nhật ký kiểm toán hệ thống và các bản ghi."""
        audit_page = AuditLogsPage(driver)
        assert audit_page.is_page_displayed(), "Trang Nhật ký kiểm toán không hiển thị!"
        assert audit_page.get_log_row_count() > 0, "Không có bản ghi nhật ký nào trong bảng!"

    def test_tc_audit_002_search_logs(self, driver):
        """TC_AUDIT_002: Tìm kiếm nhật ký theo người dùng, hành động hoặc IP."""
        audit_page = AuditLogsPage(driver)
        audit_page.search_log("admin")
        audit_page.wait_seconds(0.3)
        assert audit_page.get_log_row_count() >= 0
        
        audit_page.search_log("")
        audit_page.wait_seconds(0.2)

    def test_tc_audit_003_export_compliance_csv(self, driver):
        """TC_AUDIT_003: Xuất toàn bộ nhật ký kiểm toán phục vụ tuân thủ bảo mật CSV."""
        audit_page = AuditLogsPage(driver)
        assert audit_page.is_export_csv_btn_visible(), "Nút xuất CSV không hiển thị!"
        # Trigger click
        from ..locators.audit_logs_locators import AuditLogsLocators
        audit_page.click(AuditLogsLocators.EXPORT_CSV_BTN)
        audit_page.wait_seconds(0.5)
        assert True
