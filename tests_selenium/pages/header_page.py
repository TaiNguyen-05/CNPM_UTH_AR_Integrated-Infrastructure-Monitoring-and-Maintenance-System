"""
Page Object for Top Header bar, Profile Menu, and Quick Actions.
"""
from .base_page import BasePage
from ..locators.header_locators import HeaderLocators


class HeaderPage(BasePage):
    """Encapsulates interactions with top navigation header and user profile."""

    def is_header_visible(self) -> bool:
        return self.is_visible(HeaderLocators.HEADER_CONTAINER)

    def open_notifications(self) -> None:
        self.click(HeaderLocators.NOTIFICATIONS_BTN)

    def is_notifications_popover_open(self) -> bool:
        return self.is_visible(HeaderLocators.NOTIFICATIONS_POPOVER)

    def open_profile_menu(self) -> None:
        self.click(HeaderLocators.PROFILE_MENU_BTN)

    def is_profile_menu_open(self) -> bool:
        return self.is_visible(HeaderLocators.PROFILE_DROPDOWN)

    def terminate_session(self) -> None:
        """Sign out from header."""
        if self.is_visible(HeaderLocators.HEADER_LOGOUT_BTN, timeout=2):
            self.click(HeaderLocators.HEADER_LOGOUT_BTN)
        else:
            if not self.is_profile_menu_open():
                self.open_profile_menu()
            self.click(HeaderLocators.HEADER_LOGOUT_BTN)
