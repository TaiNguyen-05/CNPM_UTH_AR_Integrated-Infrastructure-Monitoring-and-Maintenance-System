"""
Base Locators shared across multiple pages.
"""
from selenium.webdriver.common.by import By


class BaseLocators:
    MODAL_OVERLAY = (By.CSS_SELECTOR, "div.modal-overlay, div[class*='fixed inset-0']")
    MODAL_CLOSE_BUTTON = (By.XPATH, "//button[contains(@class, 'modal-close-btn') or text()='✕']")
    TOAST_NOTIFICATION = (By.CSS_SELECTOR, "[role='alert'], div[class*='border-emerald'], div[class*='border-rose']")
    LOADING_SPINNER = (By.CSS_SELECTOR, "[class*='animate-spin'], [class*='loading']")
