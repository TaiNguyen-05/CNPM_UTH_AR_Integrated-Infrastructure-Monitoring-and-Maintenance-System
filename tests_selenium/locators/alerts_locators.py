"""
Locators for Alerts & Incident Management view.
"""
from selenium.webdriver.common.by import By


class AlertsLocators:
    # Filter Pills
    FILTER_ALL = (By.XPATH, "//button[contains(text(), 'Tất cả')]")
    FILTER_CRITICAL = (By.XPATH, "//button[contains(text(), 'Chỉ Nghiêm Trọng')]")
    FILTER_UNACKNOWLEDGED = (By.XPATH, "//button[contains(text(), 'Chưa Tiếp Nhận')]")

    # Alert Items
    ALERT_ITEMS = (By.XPATH, "//div[contains(@class, 'rounded-xl') and .//span[contains(text(), 'ALT-') or contains(text(), 'Nghiêm trọng') or contains(text(), 'Cảnh báo')]]")

    # Actions
    ACKNOWLEDGE_BTN = (By.XPATH, "//button[contains(text(), 'Tiếp Nhận Cảnh Báo') or contains(text(), 'Đã Tiếp Nhận')]")
    CREATE_TICKET_BTN = (By.XPATH, "//button[contains(text(), 'Tạo Phiếu Xử Lý')]")
    RESOLVE_ALERT_BTN = (By.XPATH, "//button[contains(text(), 'Đánh Dấu Hoàn Tất Sửa Chữa') or contains(text(), 'Đã Đóng Ticket')]")
    LAUNCH_AR_BTN = (By.XPATH, "//button[contains(text(), 'Khởi Chạy Chế Độ AR')]")
