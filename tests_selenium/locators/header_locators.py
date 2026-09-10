"""
Locators for Header Bar.
"""
from selenium.webdriver.common.by import By


class HeaderLocators:
    HEADER_CONTAINER = (By.CSS_SELECTOR, "#top-nav, nav")
    BRAND_LOGO = (By.XPATH, "//*[@id='top-nav']//a[contains(., 'CORE')]")
    NEW_ASSET_QUICK_BTN = (By.XPATH, "//button[contains(., 'Thêm Thiết Bị') or @title='Thêm thiết bị mới']")
    NOTIFICATIONS_BTN = (By.XPATH, "//button[contains(., 'Cảnh Báo Sự Cố') or contains(., 'Cảnh Báo')]")
    NOTIFICATIONS_POPOVER = (By.XPATH, "//div[contains(@class, 'border') and (contains(., 'Mức Độ') or contains(., 'Cảnh Báo') or contains(., 'Active Incidents'))]")
    PROFILE_MENU_BTN = (By.XPATH, "//*[@id='top-nav']//div[contains(@class, 'border') and .//span]")
    PROFILE_DROPDOWN = (By.XPATH, "//*[@id='top-nav']//div[contains(@class, 'border') and .//span]")
    SETTINGS_BTN = (By.XPATH, "//button[contains(., 'System Config') or contains(., 'Cấu Hình')]")
    HEADER_LOGOUT_BTN = (By.XPATH, "//button[@title='Đăng xuất khỏi hệ thống' or contains(., 'Đăng Xuất')]")
