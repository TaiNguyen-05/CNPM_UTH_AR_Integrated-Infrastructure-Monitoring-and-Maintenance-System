"""
Page Object for Sidebar Navigation between primary views.
"""
from .base_page import BasePage
from ..locators.sidebar_locators import SidebarLocators


class SidebarNavigation(BasePage):
    """Encapsulates navigation interactions in the left sidebar."""

    def go_to_digital_twin(self) -> None:
        self.click(SidebarLocators.TAB_DIGITAL_TWIN)
        self.wait_seconds(0.3)

    def go_to_telemetry(self) -> None:
        self.click(SidebarLocators.TAB_TELEMETRY)
        self.wait_seconds(0.3)

    def go_to_assets(self) -> None:
        self.click(SidebarLocators.TAB_ASSETS)
        self.wait_seconds(0.3)

    def go_to_alerts(self) -> None:
        self.click(SidebarLocators.TAB_ALERTS)
        self.wait_seconds(0.3)

    def go_to_tickets(self) -> None:
        self.click(SidebarLocators.TAB_TICKETS)
        self.wait_seconds(0.3)

    def go_to_users(self) -> None:
        self.click(SidebarLocators.TAB_USERS)
        self.wait_seconds(0.3)

    def go_to_audit_logs(self) -> None:
        self.click(SidebarLocators.TAB_AUDIT_LOGS)
        self.wait_seconds(0.3)

    def go_to_analytics(self) -> None:
        self.click(SidebarLocators.TAB_ANALYTICS)
        self.wait_seconds(0.3)

    def sign_out(self) -> None:
        self.click(SidebarLocators.LOGOUT_BUTTON)
        self.wait_seconds(0.3)

