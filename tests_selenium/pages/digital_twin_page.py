"""
Page Object for Digital Twin & 3D Datacenter Visualization.
"""
from .base_page import BasePage
from ..locators.digital_twin_locators import DigitalTwinLocators


class DigitalTwinPage(BasePage):
    """Encapsulates interactions on Digital Twin datacenter view."""

    def is_page_displayed(self) -> bool:
        return self.is_visible(DigitalTwinLocators.PAGE_TITLE) or self.is_visible(DigitalTwinLocators.FILTER_NORMAL_BTN)

    def switch_to_thermal_view(self) -> None:
        if self.is_visible(DigitalTwinLocators.FILTER_THERMAL_BTN):
            self.click(DigitalTwinLocators.FILTER_THERMAL_BTN)

    def switch_to_workload_view(self) -> None:
        if self.is_visible(DigitalTwinLocators.FILTER_WORKLOAD_BTN):
            self.click(DigitalTwinLocators.FILTER_WORKLOAD_BTN)

    def switch_to_normal_view(self) -> None:
        if self.is_visible(DigitalTwinLocators.FILTER_NORMAL_BTN):
            self.click(DigitalTwinLocators.FILTER_NORMAL_BTN)

    def select_first_node(self) -> None:
        nodes = self.find_elements(DigitalTwinLocators.NODE_CARD)
        if nodes:
            nodes[0].click()

    def toggle_fan_boost(self) -> bool:
        if self.is_visible(DigitalTwinLocators.FAN_BOOST_BTN):
            self.click(DigitalTwinLocators.FAN_BOOST_BTN)
            return True
        return False

    def restart_node(self) -> bool:
        if self.is_visible(DigitalTwinLocators.RESTART_NODE_BTN):
            self.click(DigitalTwinLocators.RESTART_NODE_BTN)
            return True
        return False

    def open_ar_overlay(self) -> bool:
        if self.is_visible(DigitalTwinLocators.AR_LAUNCH_BTN):
            self.click(DigitalTwinLocators.AR_LAUNCH_BTN)
            return True
        return False
