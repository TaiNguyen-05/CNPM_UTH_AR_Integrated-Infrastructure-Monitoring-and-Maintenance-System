"""
Locators for Audit Logs view.
"""
from selenium.webdriver.common.by import By


class AuditLogsLocators:
    PAGE_TITLE = (By.XPATH, "//h1[contains(., 'Nhật Ký Kiểm Toán')] | //h2[contains(., 'Bản Ghi Sự Kiện Bảo Mật')]")
    SEARCH_INPUT = (By.XPATH, "//input[contains(@placeholder, 'Tìm user') or contains(@placeholder, 'Tìm kiếm nhật ký') or contains(@placeholder, 'Tìm')]")
    EXPORT_CSV_BTN = (By.XPATH, "//button[contains(., 'Xuất Báo Cáo CSV') or contains(., 'Xuất File CSV') or contains(., 'CSV') or contains(., 'Export')]")
    LOG_ROWS = (By.XPATH, "//tbody/tr[not(contains(., 'Không tìm thấy'))] | //tbody//tr")

