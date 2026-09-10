"""
Locators for Authentication (Login / Register / Google SSO / Forgot Password).
"""
from selenium.webdriver.common.by import By


class AuthLocators:
    # Segmented Switcher Tabs
    LOGIN_TAB_BUTTON = (By.XPATH, "//button[contains(text(), 'Đăng Nhập')]")
    REGISTER_TAB_BUTTON = (By.XPATH, "//button[contains(text(), 'Đăng Ký')]")

    # Login Form
    LOGIN_EMAIL_INPUT = (By.XPATH, "//input[@placeholder='sjenkins@ar-imms.corp hoặc TECH-8892' or contains(@placeholder, 'sjenkins') or @type='text']")
    LOGIN_PASSWORD_INPUT = (By.XPATH, "//form//input[@type='password']")
    LOGIN_SUBMIT_BUTTON = (By.XPATH, "//button[@type='submit' and (contains(text(), 'Bắt Đầu') or contains(text(), 'Phiên Làm Việc'))]")
    LOGIN_ERROR_BANNER = (By.CSS_SELECTOR, "div[class*='border-rose-500'], div[class*='bg-rose-950']")
    FORGOT_PASSWORD_LINK = (By.XPATH, "//button[contains(text(), 'Quên mật khẩu?')]")

    # Register Form
    REG_NAME_INPUT = (By.XPATH, "//input[@placeholder='Nguyễn Văn A']")
    REG_EMAIL_INPUT = (By.XPATH, "//input[@placeholder='user@ar-imms.corp']")
    REG_ROLE_SELECT = (By.XPATH, "//select[contains(@class, 'rounded-lg') or option[@value='Technician']]")
    REG_EMPLOYEE_ID_INPUT = (By.XPATH, "//input[@placeholder='TECH-9912']")
    REG_PASSWORD_INPUT = (By.XPATH, "//label[contains(., 'Mật Khẩu') and not(contains(., 'Xác Nhận'))]/..//input | (//form//input[@type='password'])[1]")
    REG_CONFIRM_PASSWORD_INPUT = (By.XPATH, "//label[contains(., 'Xác Nhận Mật Khẩu')]/..//input | (//form//input[@type='password'])[2]")
    REG_SUBMIT_BUTTON = (By.XPATH, "//button[@type='submit' and contains(text(), 'Đăng Ký Tài Khoản')]")
    REG_ERROR_BANNER = (By.CSS_SELECTOR, "div[class*='border-rose-500']")
    REG_SUCCESS_BANNER = (By.CSS_SELECTOR, "div[class*='border-emerald-500']")

    # Quick Demo Login Buttons (Top Header in AuthView)
    DEMO_ADMIN_BUTTON = (By.XPATH, "//button[contains(text(), 'Admin (Full)') or contains(text(), 'Demo: Admin')]")
    DEMO_TECH_BUTTON = (By.XPATH, "//button[contains(text(), 'Kỹ Thuật Viên') or contains(text(), 'Demo: Kỹ Thuật Viên')]")

    # Google SSO Modal
    GOOGLE_SSO_BUTTON = (By.XPATH, "//button[contains(., 'Google SSO')]")
    GOOGLE_MODAL_EMAIL_INPUT = (By.XPATH, "//input[@placeholder='kithuatvien.datacenter@gmail.com']")
    GOOGLE_MODAL_NAME_INPUT = (By.XPATH, "//input[@placeholder='VD: Trần Văn Bình']")
    GOOGLE_MODAL_SUBMIT_BUTTON = (By.XPATH, "//button[@type='submit' and contains(text(), 'Tiếp Tục')]")
    GOOGLE_MODAL_CANCEL_BUTTON = (By.XPATH, "//div[contains(@class, 'fixed')]//button[contains(text(), 'Hủy')]")

    # Pending Approval Modal
    PENDING_MODAL_CONTAINER = (By.XPATH, "//h3[contains(text(), 'Tài Khoản Chờ Phê Duyệt')]/ancestor::div[contains(@class, 'fixed')]")
    PENDING_MODAL_CLOSE_BUTTON = (By.XPATH, "//button[contains(text(), 'Đóng / Quay Lại')]")
