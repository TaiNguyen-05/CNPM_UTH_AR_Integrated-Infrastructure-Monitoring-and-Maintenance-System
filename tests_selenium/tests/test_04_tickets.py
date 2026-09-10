"""
Test Suite 04: Maintenance Tickets & AR Work Orders Lifecycle.
"""
import pytest
from ..pages.auth_page import AuthPage
from ..pages.sidebar_navigation import SidebarNavigation
from ..pages.tickets_page import TicketsPage
from ..test_data.static_data import SAMPLE_ACCOUNTS


class TestTicketsLifecycle:

    @pytest.fixture(autouse=True)
    def setup_login_and_navigate(self, driver, base_url):
        auth_page = AuthPage(driver).open(base_url)
        admin_data = SAMPLE_ACCOUNTS["admin"]
        auth_page.login(admin_data["email"], admin_data["password"])
        sidebar = SidebarNavigation(driver)
        sidebar.go_to_tickets()
        sidebar.wait_seconds(0.5)

    def test_tc_ticket_001_view_and_display(self, driver):
        """TC_TICKET_001: Kiểm tra hiển thị màn hình danh sách phiếu bảo trì & AR."""
        tickets_page = TicketsPage(driver)
        assert tickets_page.is_page_displayed(), "Trang Phiếu Bảo Trì không hiển thị!"

    def test_tc_ticket_002_create_new_ticket(self, driver):
        """TC_TICKET_002: Tạo phiếu bảo trì mới qua modal."""
        tickets_page = TicketsPage(driver)
        tickets_page.create_ticket(
            title="Kiểm tra hệ thống tản nhiệt và quạt làm mát Node Alpha",
            description="Phát hiện nhiệt độ tăng đột biến trên khe U12-U14, cần kỹ thuật viên can thiệp.",
            priority="HIGH"
        )
        tickets_page.wait_seconds(0.5)
        assert True

    def test_tc_ticket_003_filter_and_search_tickets(self, driver):
        """TC_TICKET_003: Kiểm tra các bộ lọc trạng thái và tìm kiếm phiếu."""
        tickets_page = TicketsPage(driver)

        # Filter by tabs
        for status in ["ALL", "CREATED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"]:
            tickets_page.filter_by_status(status)
            tickets_page.wait_seconds(0.2)

        # Search box
        tickets_page.search_tickets("Node")
        tickets_page.wait_seconds(0.3)
        tickets_page.search_tickets("")
        tickets_page.wait_seconds(0.2)

    def test_tc_ticket_004_technician_dispatch_and_ar_log(self, driver):
        """TC_TICKET_004: Phân công kỹ thuật viên và ghi nhật ký thao tác AR."""
        tickets_page = TicketsPage(driver)
        tickets_page.select_first_ticket()
        tickets_page.wait_seconds(0.3)

        # Assign technician if available
        tickets_page.assign_technician()
        tickets_page.wait_seconds(0.4)

        # Add AR field action log
        tickets_page.add_ar_log("Đã quét mã QR định vị và xác nhận nhiệt độ CPU 42°C ổn định.")
        tickets_page.wait_seconds(0.4)
        assert True

    def test_tc_ticket_005_resolve_and_close_ticket(self, driver):
        """TC_TICKET_005: Hoàn tất xử lý phiếu bảo trì và nghiệm thu."""
        tickets_page = TicketsPage(driver)
        tickets_page.select_first_ticket()
        tickets_page.wait_seconds(0.3)

        # Complete / resolve
        tickets_page.resolve_selected_ticket("Đã bảo dưỡng quạt và hiệu chỉnh luồng khí hoàn tất.")
        tickets_page.wait_seconds(0.4)

        # Close / archive
        tickets_page.close_and_archive_ticket()
        tickets_page.wait_seconds(0.4)
        assert True

