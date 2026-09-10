"""
Page Object for Users & RBAC Administration view.
"""
from typing import List
from .base_page import BasePage
from ..locators.users_locators import UsersLocators


class UsersPage(BasePage):
    """Encapsulates actions on Users & Role Based Access Control view."""

    def is_page_displayed(self) -> bool:
        return self.is_visible(UsersLocators.PAGE_TITLE)

    def search_user(self, query: str) -> None:
        self.type_text(UsersLocators.SEARCH_INPUT, query)

    def filter_by_role(self, role: str) -> None:
        self.select_by_visible_text(UsersLocators.ROLE_FILTER_SELECT, role)

    def get_user_count(self) -> int:
        return len(self.find_elements(UsersLocators.USER_ROWS))

    def switch_to_users_tab(self) -> None:
        self.click(UsersLocators.USERS_TAB)

    def switch_to_rbac_tab(self) -> None:
        self.click(UsersLocators.RBAC_TAB)

    def approve_first_pending_user(self) -> bool:
        """Click approve on first pending user if available."""
        buttons = self.find_elements(UsersLocators.APPROVE_USER_BTNS)
        if buttons:
            buttons[0].click()
            return True
        return False

    def toggle_lock_first_user(self) -> bool:
        """Click lock/unlock button on first user."""
        buttons = self.find_elements(UsersLocators.LOCK_UNLOCK_BTNS)
        if buttons:
            buttons[0].click()
            return True
        return False
