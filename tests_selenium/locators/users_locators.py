"""
Locators for Users & RBAC Management view.
"""
from selenium.webdriver.common.by import By


class UsersLocators:
    PAGE_TITLE = (By.XPATH, "//h1[contains(., 'Quản Lý Người Dùng & Phân Quyền')]")
    SEARCH_INPUT = (By.XPATH, "//input[@placeholder='Tìm kiếm người dùng...']")
    ROLE_FILTER_SELECT = (By.XPATH, "//select[option[contains(text(), 'Tất cả vai trò')]]")

    # Tabs
    USERS_TAB = (By.XPATH, "//button[contains(., 'Người Dùng')]")
    RBAC_TAB = (By.XPATH, "//button[contains(., 'Ma Trận Quyền Hạn')]")

    # Table & Actions
    USER_ROWS = (By.XPATH, "//tbody//tr")
    APPROVE_USER_BTNS = (By.XPATH, "//tbody//button[@title='Phê duyệt tài khoản này']")
    LOCK_UNLOCK_BTNS = (By.XPATH, "//tbody//button[contains(@title, 'Khóa') or contains(@title, 'Mở khóa')]")
    DELETE_USER_BTNS = (By.XPATH, "//tbody//button[@title='Xóa người dùng']")
    ROLE_SELECT_DROPDOWNS = (By.XPATH, "//tbody//tr//select")
