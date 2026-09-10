"""
Locators for Telemetry & Real-Time Monitoring view.
"""
from selenium.webdriver.common.by import By


class TelemetryLocators:
    PAGE_TITLE = (By.XPATH, "//h1[contains(., 'Luồng Đo Từ Xa') or contains(., 'Telemetry')]")
    STREAM_TOGGLE_BTN = (By.XPATH, "//button[contains(., 'Luồng Trực Tiếp') or contains(., 'Đã Tạm Dừng') or contains(., 'Tạm Dừng') or contains(., 'Tiếp Tục')]")
    NODE_METRIC_CARDS = (By.XPATH, "//div[contains(@class, 'bg-[#0f141a]') or (contains(., 'CPU') and contains(., 'RAM'))]")
    LOG_STREAM_CONTAINER = (By.XPATH, "//div[contains(@class, 'font-mono') and contains(@class, 'overflow-y-auto')]")
