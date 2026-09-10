"""
Locators for Digital Twin & 3D Datacenter Visualization.
"""
from selenium.webdriver.common.by import By


class DigitalTwinLocators:
    PAGE_TITLE = (By.XPATH, "//h2[contains(., 'Mặt Cắt Kỹ Thuật Số') or contains(., 'Digital Twin')] | //span[contains(., 'MẶT BẰNG DIGITAL TWIN') or contains(., 'SƠ ĐỒ MẶT CẮT')]")
    
    # View Filters
    FILTER_NORMAL_BTN = (By.XPATH, "//button[contains(., 'Chuẩn') or contains(., 'Mặc định') or contains(., 'Normal')]")
    FILTER_THERMAL_BTN = (By.XPATH, "//button[contains(., 'Nhiệt độ') or contains(., 'Thermal') or contains(., 'Heatmap')]")
    FILTER_WORKLOAD_BTN = (By.XPATH, "//button[contains(., 'Tải CPU') or contains(., 'Workload')]")
    
    # Rack Selector Buttons
    RACK_BUTTONS = (By.XPATH, "//button[contains(@class, 'rack') or contains(., 'Rack A') or contains(., 'Tủ A')]")
    
    # Node Actions
    NODE_CARD = (By.XPATH, "//div[contains(@class, 'rack-unit') or contains(., 'Compute Node') or contains(., 'Replica')]")
    RESTART_NODE_BTN = (By.XPATH, "//button[contains(., 'Khởi Động Lại') or contains(., 'IPMI') or contains(., 'Reset')]")
    FAN_BOOST_BTN = (By.XPATH, "//button[contains(., 'Tăng Tốc Quạt') or contains(., 'Fan Boost') or contains(., 'Max Fan')]")
    QR_MODAL_BTN = (By.XPATH, "//button[contains(., 'Mã QR') or contains(., 'QR Code') or contains(., 'Quét QR')]")
    
    # AR Overlay
    AR_LAUNCH_BTN = (By.XPATH, "//button[contains(., 'Kích Hoạt Không Gian AR') or contains(., 'AR')]")
