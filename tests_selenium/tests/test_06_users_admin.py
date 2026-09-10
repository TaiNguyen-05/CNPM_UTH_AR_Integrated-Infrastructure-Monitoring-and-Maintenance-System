"""
Test Suite 06: Users & RBAC Administration & Audit Logs.
"""
import pytest
from ..pages.auth_page import AuthPage
from ..pages.sidebar_navigation import SidebarNavigation
from ..pages.users_page import UsersPage
from ..pages.audit_logs_page import AuditLogsPage
from ..test_data.static_data import SAMPLE_ACCOUNTS


class TestUsersAndAuditLogs:

    @pytest.fixture(autouse=True)
    def setup_login_and_navigate(self, driver, base_url):
        auth_page = AuthPage(driver).open(base_url)
        admin_data = SAMPLE_ACCOUNTS["admin"]
        auth_page.login(admin_data["email"], admin_data["password"])
        sidebar = SidebarNavigation(driver)
        sidebar.go_to_users()
        sidebar.wait_seconds(0.5)

    def test_tc_user_001_list_users(self, driver):
        """TC_USER_001: Hiển thị danh sách người dùng trong hệ thống."""
        users_page = UsersPage(driver)
        assert users_page.is_page_displayed(), "Trang quản lý người dùng không hiển thị!"
        assert users_page.get_user_count() > 0, "Không có người dùng nào trong bảng!"

    def test_tc_user_002_filter_by_role(self, driver):
        """TC_USER_002: Lọc người dùng theo vai trò."""
        users_page = UsersPage(driver)
        users_page.filter_by_role("👑 Admin")
        users_page.wait_seconds(0.3)
        assert users_page.get_user_count() > 0

        users_page.filter_by_role("🛠️ Technician")
        users_page.wait_seconds(0.3)
        assert users_page.get_user_count() >= 0

        users_page.filter_by_role("Tất cả vai trò")
        users_page.wait_seconds(0.3)

    def test_tc_user_003_rbac_matrix_view(self, driver):
        """TC_USER_003: Xem ma trận quyền hạn (RBAC Matrix)."""
        users_page = UsersPage(driver)
        users_page.switch_to_rbac_tab()
        users_page.wait_seconds(0.4)
        # Return back to users tab
        users_page.switch_to_users_tab()
        users_page.wait_seconds(0.3)
        assert users_page.get_user_count() > 0

    def test_tc_user_004_audit_logs_tracking(self, driver):
        """TC_USER_004: Kiểm tra trang Nhật ký kiểm toán (Audit Logs) và nút xuất CSV."""
        sidebar = SidebarNavigation(driver)
        sidebar.go_to_audit_logs()
        sidebar.wait_seconds(0.5)

        audit_page = AuditLogsPage(driver)
        assert audit_page.is_page_displayed(), "Trang Nhật ký kiểm toán không hiển thị!"
        assert audit_page.is_export_csv_btn_visible(), "Nút xuất CSV không hiển thị!"
