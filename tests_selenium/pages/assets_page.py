"""
Page Object for Assets & Rack Management view (CRUD, Search, Filter, AR Marker).
"""
from typing import List
from .base_page import BasePage
from ..locators.assets_locators import AssetsLocators


class AssetsPage(BasePage):
    """Encapsulates actions on Assets & Racks view."""

    def switch_to_devices_tab(self) -> None:
        self.click(AssetsLocators.DEVICES_SUBTAB)

    def switch_to_racks_tab(self) -> None:
        self.click(AssetsLocators.RACKS_SUBTAB)

    def search(self, query: str) -> None:
        self.type_text(AssetsLocators.SEARCH_INPUT, query)

    def filter_by_rack(self, rack_name: str) -> None:
        self.select_by_visible_text(AssetsLocators.RACK_FILTER_SELECT, rack_name)

    def get_visible_device_names(self) -> List[str]:
        elements = self.find_elements(AssetsLocators.DEVICE_NAME_CELLS)
        return [el.text.strip() for el in elements if el.text.strip()]

    def open_add_device_modal(self) -> None:
        self.click(AssetsLocators.ADD_DEVICE_BTN)

    def fill_and_submit_new_device(self, name: str, model: str, rack: str = "Rack A1",
                                   u_position: str = "U10-12", serial: str = "",
                                   manufacturer: str = "Dell Technologies",
                                   ip_address: str = "10.0.1.99") -> None:
        """Fill new hardware modal form and submit."""
        self.type_text(AssetsLocators.MODAL_ASSET_NAME_INPUT, name)
        self.type_text(AssetsLocators.MODAL_ASSET_MODEL_INPUT, model)
        if manufacturer and self.is_visible(AssetsLocators.MODAL_ASSET_MANUFACTURER_INPUT):
            self.type_text(AssetsLocators.MODAL_ASSET_MANUFACTURER_INPUT, manufacturer)
        if rack and self.is_visible(AssetsLocators.MODAL_ASSET_RACK_SELECT):
            try:
                self.select_by_value(AssetsLocators.MODAL_ASSET_RACK_SELECT, rack)
            except Exception:
                pass
        if u_position and self.is_visible(AssetsLocators.MODAL_ASSET_U_INPUT):
            self.type_text(AssetsLocators.MODAL_ASSET_U_INPUT, u_position)
        if serial and self.is_visible(AssetsLocators.MODAL_ASSET_SERIAL_INPUT):
            self.type_text(AssetsLocators.MODAL_ASSET_SERIAL_INPUT, serial)
        if ip_address and self.is_visible(AssetsLocators.MODAL_ASSET_IP_INPUT):
            self.type_text(AssetsLocators.MODAL_ASSET_IP_INPUT, ip_address)
        
        # Click submit
        self.click(AssetsLocators.MODAL_ASSET_SUBMIT_BTN)
        self.wait_seconds(0.8)



    def select_first_device(self) -> None:
        rows = self.find_elements(AssetsLocators.DEVICE_TABLE_ROWS)
        if rows:
            rows[0].click()

    def is_download_svg_button_visible(self) -> bool:
        return self.is_visible(AssetsLocators.DOWNLOAD_SVG_BTN)
