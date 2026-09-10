"""
Page Object for Maintenance Tickets & Work Orders view.
"""
from typing import List
from .base_page import BasePage
from ..locators.tickets_locators import TicketsLocators


class TicketsPage(BasePage):
    """Encapsulates actions on Tickets and AR Work Order dispatch."""

    def is_page_displayed(self) -> bool:
        return self.is_visible(TicketsLocators.PAGE_TITLE) or self.is_visible(TicketsLocators.CREATE_TICKET_BTN)

    def open_create_ticket_modal(self) -> None:
        self.click(TicketsLocators.CREATE_TICKET_BTN)

    def create_ticket(self, title: str, description: str = "", priority: str = "HIGH") -> None:
        self.open_create_ticket_modal()
        self.type_text(TicketsLocators.MODAL_CREATE_TITLE_INPUT, title)
        if priority and self.is_visible(TicketsLocators.MODAL_CREATE_PRIORITY_SELECT):
            self.select_by_value(TicketsLocators.MODAL_CREATE_PRIORITY_SELECT, priority)
        if description and self.is_visible(TicketsLocators.MODAL_CREATE_DESC_INPUT):
            self.type_text(TicketsLocators.MODAL_CREATE_DESC_INPUT, description)
        self.click(TicketsLocators.MODAL_CREATE_SUBMIT_BTN)

    def filter_by_status(self, status_code: str = "ALL") -> None:
        status_map = {
            "ALL": TicketsLocators.FILTER_ALL,
            "CREATED": TicketsLocators.FILTER_CREATED,
            "ASSIGNED": TicketsLocators.FILTER_ASSIGNED,
            "IN_PROGRESS": TicketsLocators.FILTER_IN_PROGRESS,
            "RESOLVED": TicketsLocators.FILTER_RESOLVED,
            "CLOSED": TicketsLocators.FILTER_CLOSED,
        }
        if status_code in status_map and self.is_visible(status_map[status_code]):
            self.click(status_map[status_code])

    def search_tickets(self, query: str) -> None:
        self.type_text(TicketsLocators.SEARCH_INPUT, query)

    def get_ticket_count(self) -> int:
        return len(self.find_elements(TicketsLocators.TICKET_CARDS))

    def select_first_ticket(self) -> None:
        cards = self.find_elements(TicketsLocators.TICKET_CARDS)
        if cards:
            try:
                self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", cards[0])
                self.wait_seconds(0.2)
                cards[0].click()
            except Exception:
                self.driver.execute_script("arguments[0].click();", cards[0])


    def assign_technician(self) -> bool:
        if self.is_visible(TicketsLocators.ACTION_ASSIGN_BTN):
            self.click(TicketsLocators.ACTION_ASSIGN_BTN)
            self.wait_seconds(0.3)
            if self.is_visible(TicketsLocators.MODAL_ASSIGN_TECH_SELECT):
                # Select second option in dropdown (first technician)
                select_el = self.find_element(TicketsLocators.MODAL_ASSIGN_TECH_SELECT)
                options = select_el.find_elements("tag name", "option")
                if len(options) > 1:
                    options[1].click()
                self.click(TicketsLocators.MODAL_ASSIGN_SUBMIT_BTN)
                return True
        return False

    def start_repair_work(self) -> bool:
        if self.is_visible(TicketsLocators.ACTION_START_BTN):
            self.click(TicketsLocators.ACTION_START_BTN)
            return True
        return False

    def add_ar_log(self, notes: str = "Đã quét QR kiểm tra tải và thay thế linh kiện.") -> bool:
        if self.is_visible(TicketsLocators.ACTION_AR_LOG_BTN):
            self.click(TicketsLocators.ACTION_AR_LOG_BTN)
            self.wait_seconds(0.3)
            if self.is_visible(TicketsLocators.MODAL_AR_LOG_NOTES_INPUT):
                self.type_text(TicketsLocators.MODAL_AR_LOG_NOTES_INPUT, notes)
                self.click(TicketsLocators.MODAL_AR_LOG_SUBMIT_BTN)
                return True
        return False

    def resolve_selected_ticket(self, notes: str = "Đã sửa chữa và kiểm thử luồng nhiệt độ.") -> bool:
        if self.is_visible(TicketsLocators.ACTION_RESOLVE_BTN):
            self.click(TicketsLocators.ACTION_RESOLVE_BTN)
            self.wait_seconds(0.3)
            if self.is_visible(TicketsLocators.MODAL_RESOLVE_NOTES_INPUT):
                self.type_text(TicketsLocators.MODAL_RESOLVE_NOTES_INPUT, notes)
                self.click(TicketsLocators.MODAL_RESOLVE_SUBMIT_BTN)
                return True
        return False

    def close_and_archive_ticket(self) -> bool:
        if self.is_visible(TicketsLocators.ACTION_CLOSE_BTN):
            self.click(TicketsLocators.ACTION_CLOSE_BTN)
            return True
        return False

