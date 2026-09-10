"""
Locators for Sidebar / Operations View Navigation.
"""
from selenium.webdriver.common.by import By


class SidebarLocators:
    SIDEBAR_NAV = (By.CSS_SELECTOR, "#top-nav, #operations, nav")
    TAB_DIGITAL_TWIN = (By.XPATH, "//section[@id='operations']//button[contains(., 'Telemetry') or contains(., 'Digital Twin') or contains(., 'Mặt Bằng')] | //button[contains(., 'Digital Twin')]")
    TAB_TELEMETRY = (By.XPATH, "//section[@id='operations']//button[contains(., 'Telemetry') or contains(., 'Chỉ Số')] | //button[contains(., 'Telemetry')]")
    TAB_ASSETS = (By.XPATH, "//section[@id='operations']//button[contains(., 'Rack & Thiết Bị') or contains(., 'Tủ Rack')] | //button[contains(., 'Tủ Rack & Thiết Bị')]")
    TAB_ALERTS = (By.XPATH, "//section[@id='operations']//button[contains(., 'Cảnh Báo')] | //button[contains(., 'Cảnh Báo Sự Cố')]")
    TAB_TICKETS = (By.XPATH, "//section[@id='operations']//button[contains(., 'Phiếu Bảo Trì')] | //button[contains(., 'Phiếu Bảo Trì')]")
    TAB_USERS = (By.XPATH, "//section[@id='operations']//button[contains(., 'Người Dùng & RBAC') or contains(., 'Người Dùng')] | //button[contains(., 'Người Dùng')]")
    TAB_AUDIT_LOGS = (By.XPATH, "//section[@id='operations']//button[contains(., 'Nhật Ký Kiểm Toán') or contains(., 'Nhật Ký')] | //button[contains(., 'Nhật Ký Kiểm Toán')]")
    TAB_ANALYTICS = (By.XPATH, "//section[@id='operations']//button[contains(., 'Báo Cáo & PUE') or contains(., 'PUE')] | //button[contains(., 'Báo Cáo & PUE')]")

    SUPPORT_BUTTON = (By.XPATH, "//button[contains(., 'Documentation') or contains(., 'Tài Liệu') or contains(., 'Trợ Giúp')]")
    LOGOUT_BUTTON = (By.XPATH, "//button[@title='Đăng xuất khỏi hệ thống' or contains(., 'Đăng Xuất')]")

