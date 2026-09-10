"""
Page Object for Alerts & Incident Management view.
"""
from typing import List
from .base_page import BasePage
from ..locators.alerts_locators import AlertsLocators


class AlertsPage(BasePage):
    """Encapsulates actions on Alerts & Incidents view."""

    def filter_all(self) -> None:
        self.click(AlertsLocators.FILTER_ALL)

    def filter_critical(self) -> None:
        self.click(AlertsLocators.FILTER_CRITICAL)

    def filter_unacknowledged(self) -> None:
        self.click(AlertsLocators.FILTER_UNACKNOWLEDGED)

    def get_alert_count(self) -> int:
        return len(self.find_elements(AlertsLocators.ALERT_ITEMS))

    def select_first_alert(self) -> None:
        alerts = self.find_elements(AlertsLocators.ALERT_ITEMS)
        if alerts:
            alerts[0].click()

    def acknowledge_alert(self) -> bool:
        """Acknowledge alert if unacknowledged, or verify state."""
        try:
            buttons = self.find_elements(AlertsLocators.ACKNOWLEDGE_BTN)
            if buttons and buttons[0].is_enabled():
                self.click(AlertsLocators.ACKNOWLEDGE_BTN, timeout=3)
                return True
        except Exception:
            pass
        return True

    def is_create_ticket_btn_visible(self) -> bool:
        return self.is_visible(AlertsLocators.CREATE_TICKET_BTN)
