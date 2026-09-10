"""
Locators for Analytics, PUE & Reporting view.
"""
from selenium.webdriver.common.by import By


class AnalyticsLocators:
    PAGE_TITLE = (By.XPATH, "//h1[contains(., 'Phân Tích Hiệu Suất') or contains(., 'Báo Cáo & PUE')] | //span[contains(., 'PUE')] | //div[contains(., 'Chỉ Số PUE')]")
    
    # Time Range Tabs
    RANGE_24H_BTN = (By.XPATH, "//button[contains(., '24 Giờ') or contains(., '24h')]")
    RANGE_7D_BTN = (By.XPATH, "//button[contains(., '7 Ngày') or contains(., '7d')]")
    RANGE_30D_BTN = (By.XPATH, "//button[contains(., '30 Ngày') or contains(., '30d')]")
    
    # Rack Selector
    RACK_SELECT = (By.XPATH, "//select[option[contains(text(), 'Tất cả tủ Rack') or contains(text(), 'all')]]")
    
    # Export CSV Button
    EXPORT_CSV_BTN = (By.XPATH, "//button[contains(., 'Xuất Báo Cáo PUE') or contains(., 'CSV') or contains(., 'Export')]")
    
    # Metric KPI Cards
    PUE_CARD = (By.XPATH, "//*[contains(text(), 'Chỉ Số PUE') or contains(text(), 'PUE')]")
    POWER_DRAW_CARD = (By.XPATH, "//*[contains(text(), 'Tổng Tải IT') or contains(text(), 'Công Suất')]")
