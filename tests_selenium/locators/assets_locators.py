"""
Locators for Assets & Rack Management view.
"""
from selenium.webdriver.common.by import By


class AssetsLocators:
    # Sub-tab switchers
    DEVICES_SUBTAB = (By.XPATH, "//button[contains(., 'Thiết Bị')]")
    RACKS_SUBTAB = (By.XPATH, "//button[contains(., 'Tủ Rack')]")

    # Search & Filter
    SEARCH_INPUT = (By.XPATH, "//input[contains(@placeholder, 'Tìm thiết bị') or contains(@placeholder, 'Tìm tên tủ') or contains(@placeholder, 'Tìm')]")
    RACK_FILTER_SELECT = (By.XPATH, "//select[option[contains(text(), 'Tất cả tủ Rack') or contains(text(), 'All Racks')]]")

    # Action Buttons
    ADD_DEVICE_BTN = (By.XPATH, "//button[contains(., 'Thêm Thiết Bị Mới') or contains(., 'Thêm Thiết Bị')]")
    ADD_RACK_BTN = (By.XPATH, "//button[contains(., 'Thêm Tủ Rack Mới') or contains(., 'Thêm Tủ Rack')]")

    # Device Table
    DEVICE_TABLE_ROWS = (By.XPATH, "//tbody//tr")
    DEVICE_NAME_CELLS = (By.XPATH, "//tbody//tr/td[2]")

    # Modal: Add/Edit Asset (Scoped to modal container)
    MODAL_ASSET_NAME_INPUT = (By.XPATH, "//div[contains(@class, 'modal-box')]//input[@placeholder='VD: SRV-COMPUTE-08C']")
    MODAL_ASSET_MODEL_INPUT = (By.XPATH, "//div[contains(@class, 'modal-box')]//input[@placeholder='VD: Dell PowerEdge R750']")
    MODAL_ASSET_MANUFACTURER_INPUT = (By.XPATH, "//div[contains(@class, 'modal-box')]//label[contains(text(), 'Nhà Sản Xuất')]/following-sibling::input")
    MODAL_ASSET_RACK_SELECT = (By.XPATH, "//div[contains(@class, 'modal-box')]//select")
    MODAL_ASSET_U_INPUT = (By.XPATH, "//div[contains(@class, 'modal-box')]//input[@placeholder='VD: U10-12']")
    MODAL_ASSET_SERIAL_INPUT = (By.XPATH, "//div[contains(@class, 'modal-box')]//input[@placeholder='VD: DELL-99214X']")
    MODAL_ASSET_IP_INPUT = (By.XPATH, "//div[contains(@class, 'modal-box')]//input[@placeholder='10.0.1.X']")
    MODAL_ASSET_SUBMIT_BTN = (By.XPATH, "//div[contains(@class, 'modal-box')]//button[@type='submit']")
    MODAL_ASSET_CANCEL_BTN = (By.XPATH, "//div[contains(@class, 'modal-box')]//button[contains(text(), 'Hủy Bỏ')]")

    # Detail / Preview Pane
    DOWNLOAD_SVG_BTN = (By.XPATH, "//button[contains(., 'Tải SVG QR') or contains(., 'Tải Mã AR') or contains(., 'Tải Tem AR') or contains(., 'In Nhãn Tem')]")


