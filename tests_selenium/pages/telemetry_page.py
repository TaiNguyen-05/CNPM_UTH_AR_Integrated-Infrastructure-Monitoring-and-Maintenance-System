"""
Page Object for Telemetry & Real-Time Monitoring Stream view.
"""
from typing import List
from .base_page import BasePage
from ..locators.telemetry_locators import TelemetryLocators


class TelemetryPage(BasePage):
    """Encapsulates actions on Real-Time Telemetry view."""

    def toggle_streaming(self) -> None:
        self.click(TelemetryLocators.STREAM_TOGGLE_BTN)

    def is_stream_button_visible(self) -> bool:
        return self.is_visible(TelemetryLocators.STREAM_TOGGLE_BTN)

    def get_metric_cards_count(self) -> int:
        return len(self.find_elements(TelemetryLocators.NODE_METRIC_CARDS))
