"""
Locators for Tickets & Work Orders view.
"""
from selenium.webdriver.common.by import By


class TicketsLocators:
    PAGE_TITLE = (By.XPATH, "//h1[contains(., 'Phiếu Bảo Trì') or contains(., 'Vòng Đời Phiếu')] | //h2[contains(., 'Phiếu Bảo Trì')]")
    CREATE_TICKET_BTN = (By.XPATH, "//button[contains(., 'Tạo Phiếu Bảo Trì Mới') or contains(., 'Tạo Phiếu')]")
    SEARCH_INPUT = (By.XPATH, "//input[@placeholder='Tìm kiếm phiếu...' or @placeholder='Tìm phiếu theo mã, tiêu đề, node...' or contains(@placeholder, 'Tìm kiếm')]")

    # Filter Tabs
    FILTER_ALL = (By.XPATH, "//button[contains(., 'Tất cả')]")
    FILTER_CREATED = (By.XPATH, "//button[contains(., 'Mới tạo')]")
    FILTER_ASSIGNED = (By.XPATH, "//button[contains(., 'Đã giao')]")
    FILTER_IN_PROGRESS = (By.XPATH, "//button[contains(., 'Đang xử lý') or contains(., 'Đang sửa')]")
    FILTER_RESOLVED = (By.XPATH, "//button[contains(., 'Chờ duyệt') or contains(., 'Chờ nghiệm thu')]")
    FILTER_CLOSED = (By.XPATH, "//button[contains(., 'Đã đóng')]")

    # Ticket Cards & List
    TICKET_CARDS = (By.XPATH, "//div[contains(@class, 'p-3.5') and .//span[contains(@class, 'font-mono')]]")

    # Action Buttons on Selected Ticket Detail
    ACTION_ASSIGN_BTN = (By.XPATH, "//button[contains(., 'Phân công KTV') or contains(., 'Đổi KTV')]")
    ACTION_START_BTN = (By.XPATH, "//button[contains(., 'Bắt Đầu Sửa Chữa')]")
    ACTION_AR_LOG_BTN = (By.XPATH, "//button[contains(., 'Ghi Nhật Ký AR') or contains(., 'Ghi thêm thao tác')]")
    ACTION_RESOLVE_BTN = (By.XPATH, "//button[contains(., 'Hoàn Tất Xử Lý')]")
    ACTION_CLOSE_BTN = (By.XPATH, "//button[contains(., 'Nghiệm Thu & Đóng Phiếu')]")
    ACTION_LAUNCH_AR_BTN = (By.XPATH, "//button[contains(., 'Mở AR HUD')]")

    # Modal: Create Ticket
    MODAL_CREATE_TITLE_INPUT = (By.XPATH, "//form//input[@type='text' or contains(@placeholder, 'Vd: Thay quạt')]")
    MODAL_CREATE_PRIORITY_SELECT = (By.XPATH, "//form//select[option[@value='CRITICAL' or @value='HIGH']]")
    MODAL_CREATE_NODE_SELECT = (By.XPATH, "//form//select[option[contains(@value, 'node-')]]")
    MODAL_CREATE_DESC_INPUT = (By.XPATH, "//form//textarea")
    MODAL_CREATE_SUBMIT_BTN = (By.XPATH, "//form//button[@type='submit' or contains(., 'Tạo Phiếu')]")

    # Modal: Assign Technician
    MODAL_ASSIGN_TECH_SELECT = (By.XPATH, "//form//select[option[contains(text(), 'Chọn kỹ thuật viên') or contains(text(), 'Technician')]]")
    MODAL_ASSIGN_SUBMIT_BTN = (By.XPATH, "//form//button[@type='submit' or contains(., 'Lưu Phân Công')]")

    # Modal: AR Log Action
    MODAL_AR_LOG_TYPE_SELECT = (By.XPATH, "//form//select[option[@value='QR_SCAN_VERIFIED']]")
    MODAL_AR_LOG_NOTES_INPUT = (By.XPATH, "//form//textarea[contains(@placeholder, 'Vd: Đã thay thế')]")
    MODAL_AR_LOG_SUBMIT_BTN = (By.XPATH, "//form//button[@type='submit' or contains(., 'Ghi Nhật Ký')]")

    # Modal: Resolve Ticket
    MODAL_RESOLVE_NOTES_INPUT = (By.XPATH, "//form//textarea[contains(@placeholder, 'Ghi chú các linh kiện') or contains(@placeholder, 'kết quả')]")
    MODAL_RESOLVE_SUBMIT_BTN = (By.XPATH, "//form//button[@type='submit' or contains(., 'Gửi Nghiệm Thu') or contains(., 'Xác Nhận')]")

