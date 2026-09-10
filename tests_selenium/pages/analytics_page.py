"""
Page Object for Analytics & PUE reporting view.
"""
from .base_page import BasePage
from ..locators.analytics_locators import AnalyticsLocators


class AnalyticsPage(BasePage):
    """Encapsulates actions on Analytics and PUE reports."""

    def is_page_displayed(self) -> bool:
        return self.is_visible(AnalyticsLocators.PAGE_TITLE) or self.is_visible(AnalyticsLocators.PUE_CARD)

    def select_time_range_24h(self) -> None:
        if self.is_visible(AnalyticsLocators.RANGE_24H_BTN):
            self.click(AnalyticsLocators.RANGE_24H_BTN)

    def select_time_range_7d(self) -> None:
        if self.is_visible(AnalyticsLocators.RANGE_7D_BTN):
            self.click(AnalyticsLocators.RANGE_7D_BTN)

    def select_time_range_30d(self) -> None:
        if self.is_visible(AnalyticsLocators.RANGE_30D_BTN):
            self.click(AnalyticsLocators.RANGE_30D_BTN)

    def is_export_csv_btn_visible(self) -> bool:
        return self.is_visible(AnalyticsLocators.EXPORT_CSV_BTN)

    def export_csv(self) -> bool:
        if self.is_visible(AnalyticsLocators.EXPORT_CSV_BTN):
            self.click(AnalyticsLocators.EXPORT_CSV_BTN)
            return True
        return False
