"""
Test Suite 01: Authentication & Authorization (Login, Register, Validations, Sign Out).
"""
import pytest
from ..pages.auth_page import AuthPage
from ..pages.header_page import HeaderPage
from ..pages.sidebar_navigation import SidebarNavigation
from ..test_data.static_data import SAMPLE_ACCOUNTS
from ..test_data.test_data_generator import generate_random_user


class TestAuthentication:

    def test_tc_auth_001_login_admin_success(self, driver, base_url):
        """TC_AUTH_001: Đăng nhập thành công với tài khoản Admin mặc định."""
        auth_page = AuthPage(driver).open(base_url)
        admin_data = SAMPLE_ACCOUNTS["admin"]

        auth_page.login(admin_data["email"], admin_data["password"])

        header_page = HeaderPage(driver)
        assert header_page.is_header_visible(), "Header không hiển thị sau khi Admin đăng nhập!"

    def test_tc_auth_002_login_technician_success(self, driver, base_url):
        """TC_AUTH_002: Đăng nhập thành công với tài khoản Kỹ thuật viên (Technician)."""
        auth_page = AuthPage(driver).open(base_url)
        tech_data = SAMPLE_ACCOUNTS["technician"]

        auth_page.login(tech_data["email"], tech_data["password"])

        header_page = HeaderPage(driver)
        assert header_page.is_header_visible(), "Header không hiển thị sau khi Kỹ thuật viên đăng nhập!"

    def test_tc_auth_003_login_invalid_account(self, driver, base_url):
        """TC_AUTH_003: Đăng nhập thất bại khi nhập tài khoản không tồn tại."""
        auth_page = AuthPage(driver).open(base_url)

        auth_page.login("nonexistent_user_9999@ar-imms.corp", "WrongPass123!")

        auth_page.wait_seconds(0.8)
        error_msg = auth_page.get_login_error_message()
        assert len(error_msg) > 0, "Không hiển thị thông báo lỗi khi đăng nhập tài khoản sai!"

    def test_tc_auth_004_register_technician_success(self, driver, base_url):
        """TC_AUTH_004: Đăng ký tài khoản Kỹ thuật viên mới và kích hoạt thành công."""
        auth_page = AuthPage(driver).open(base_url)
        new_user = generate_random_user(role="Technician")

        auth_page.register_user(
            name=new_user["name"],
            email=new_user["email"],
            role="Technician",
            employee_id=new_user["employee_id"],
            password=new_user["password"],
            confirm_password=new_user["password"]
        )

        auth_page.wait_seconds(0.8)
        header_page = HeaderPage(driver)
        assert header_page.is_header_visible(), "Hệ thống không chuyển vào Dashboard sau khi KTV đăng ký!"

    def test_tc_auth_005_register_password_mismatch(self, driver, base_url):
        """TC_AUTH_005: Đăng ký thất bại khi xác nhận mật khẩu không trùng khớp."""
        auth_page = AuthPage(driver).open(base_url)
        new_user = generate_random_user()

        auth_page.register_user(
            name=new_user["name"],
            email=new_user["email"],
            role="Technician",
            password="Password123!",
            confirm_password="DifferentPassword456!"
        )

        error_msg = auth_page.get_register_error_message()
        assert "không trùng khớp" in error_msg or len(error_msg) > 0, "Không hiển thị lỗi khi mật khẩu không khớp!"

    def test_tc_auth_006_logout_session(self, driver, base_url):
        """TC_AUTH_006: Đăng xuất và kiểm tra phiên làm việc chuyển về màn hình đăng nhập."""
        auth_page = AuthPage(driver).open(base_url)
        admin_data = SAMPLE_ACCOUNTS["admin"]
        auth_page.login(admin_data["email"], admin_data["password"])

        header_page = HeaderPage(driver)
        assert header_page.is_header_visible()

        sidebar = SidebarNavigation(driver)
        sidebar.sign_out()

        auth_page.wait_seconds(0.5)
        assert auth_page.is_auth_screen_displayed(), "Không quay lại màn hình Auth sau khi Đăng xuất!"
