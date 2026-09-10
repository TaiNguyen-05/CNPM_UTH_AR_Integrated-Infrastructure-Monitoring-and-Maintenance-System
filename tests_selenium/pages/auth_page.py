"""
Page Object for Authentication View (Login, Register, Demo Quick Login, Google OAuth modal).
"""
from .base_page import BasePage
from ..locators.auth_locators import AuthLocators


class AuthPage(BasePage):
    """Encapsulates all actions and verifications on the Authentication view."""

    def open(self, base_url: str) -> "AuthPage":
        self.navigate_to(base_url)
        return self

    def is_auth_screen_displayed(self) -> bool:
        return self.is_visible(AuthLocators.LOGIN_EMAIL_INPUT) or self.is_visible(AuthLocators.LOGIN_TAB_BUTTON)

    def switch_to_login_tab(self) -> "AuthPage":
        self.click(AuthLocators.LOGIN_TAB_BUTTON)
        return self

    def switch_to_register_tab(self) -> "AuthPage":
        self.click(AuthLocators.REGISTER_TAB_BUTTON)
        return self

    def login(self, email: str, password: str) -> None:
        """Perform standard login."""
        self.switch_to_login_tab()
        self.type_text(AuthLocators.LOGIN_EMAIL_INPUT, email)
        self.type_text(AuthLocators.LOGIN_PASSWORD_INPUT, password)
        self.click(AuthLocators.LOGIN_SUBMIT_BUTTON)

    def login_via_demo_admin(self) -> None:
        """Perform quick login via Demo Admin button if available."""
        if self.is_visible(AuthLocators.DEMO_ADMIN_BUTTON):
            self.click(AuthLocators.DEMO_ADMIN_BUTTON)

    def register_user(self, name: str, email: str, role: str = "Technician",
                      employee_id: str = "", password: str = "Pass123456",
                      confirm_password: str = "Pass123456") -> None:
        """Perform user registration."""
        self.switch_to_register_tab()
        self.type_text(AuthLocators.REG_NAME_INPUT, name)
        self.type_text(AuthLocators.REG_EMAIL_INPUT, email)
        if role:
            self.select_by_value(AuthLocators.REG_ROLE_SELECT, role)
        if employee_id:
            self.type_text(AuthLocators.REG_EMPLOYEE_ID_INPUT, employee_id)
        self.type_text(AuthLocators.REG_PASSWORD_INPUT, password)
        self.type_text(AuthLocators.REG_CONFIRM_PASSWORD_INPUT, confirm_password)
        self.click(AuthLocators.REG_SUBMIT_BUTTON)

    def get_login_error_message(self) -> str:
        """Retrieve login validation/error text."""
        return self.get_text(AuthLocators.LOGIN_ERROR_BANNER)

    def get_register_error_message(self) -> str:
        """Retrieve registration validation/error text."""
        return self.get_text(AuthLocators.REG_ERROR_BANNER)

    def get_register_success_message(self) -> str:
        """Retrieve registration success banner text."""
        return self.get_text(AuthLocators.REG_SUCCESS_BANNER)

    def is_pending_approval_modal_displayed(self) -> bool:
        """Check if 'Tài Khoản Chờ Phê Duyệt' modal popped up."""
        return self.is_visible(AuthLocators.PENDING_MODAL_CONTAINER)
