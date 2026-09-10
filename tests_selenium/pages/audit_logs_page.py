"""
Page Object for Audit Trail and Logs view.
"""
from typing import List
from .base_page import BasePage
from ..locators.audit_logs_locators import AuditLogsLocators


class AuditLogsPage(BasePage):
    """Encapsulates actions on Audit Logs view."""

    def is_page_displayed(self) -> bool:
        return self.is_visible(AuditLogsLocators.PAGE_TITLE)

    def search_log(self, query: str) -> None:
        self.type_text(AuditLogsLocators.SEARCH_INPUT, query)

    def is_export_csv_btn_visible(self) -> bool:
        return self.is_visible(AuditLogsLocators.EXPORT_CSV_BTN)

    def get_log_row_count(self) -> int:
        return len(self.find_elements(AuditLogsLocators.LOG_ROWS))
