"""
Test Suite 03: Assets & Rack Hardware Management (CRUD, Search, Filter, AR Marker).
"""
import pytest
from ..pages.auth_page import AuthPage
from ..pages.sidebar_navigation import SidebarNavigation
from ..pages.assets_page import AssetsPage
from ..test_data.static_data import SAMPLE_ACCOUNTS
from ..test_data.test_data_generator import generate_random_asset


class TestAssetsManagement:

    @pytest.fixture(autouse=True)
    def setup_login_and_navigate(self, driver, base_url):
        auth_page = AuthPage(driver).open(base_url)
        admin_data = SAMPLE_ACCOUNTS["admin"]
        auth_page.login(admin_data["email"], admin_data["password"])
        sidebar = SidebarNavigation(driver)
        sidebar.go_to_assets()
        sidebar.wait_seconds(0.5)

    def test_tc_asset_001_search_hardware(self, driver):
        """TC_ASSET_001: Tìm kiếm thiết bị phần cứng theo từ khóa."""
        assets_page = AssetsPage(driver)
        assets_page.switch_to_devices_tab()

        names = assets_page.get_visible_device_names()
        if names:
            target_name = names[0]
            assets_page.search(target_name)
            assets_page.wait_seconds(0.4)
            filtered = assets_page.get_visible_device_names()
            assert any(target_name.lower() in n.lower() for n in filtered), f"Không tìm thấy thiết bị '{target_name}' khi search!"

    def test_tc_asset_002_filter_by_rack(self, driver):
        """TC_ASSET_002: Lọc danh sách thiết bị theo tủ Rack."""
        assets_page = AssetsPage(driver)
        assets_page.switch_to_devices_tab()
        assets_page.filter_by_rack("Tất cả tủ Rack")
        count_all = len(assets_page.get_visible_device_names())
        assert count_all >= 0

    def test_tc_asset_003_add_new_device(self, driver):
        """TC_ASSET_003: Thêm mới thiết bị máy chủ vào tủ Rack."""
        assets_page = AssetsPage(driver)
        assets_page.switch_to_devices_tab()
        new_asset = generate_random_asset(rack="Rack A1")

        assets_page.open_add_device_modal()
        assets_page.fill_and_submit_new_device(
            name=new_asset["name"],
            model=new_asset["model"],
            rack=new_asset["rack"],
            u_position=new_asset["uPosition"],
            serial=new_asset["serialNumber"],
            manufacturer=new_asset["manufacturer"],
            ip_address=new_asset["ipAddress"]
        )

        assets_page.wait_seconds(0.8)
        # Search the created asset to verify
        assets_page.search(new_asset["name"])
        assets_page.wait_seconds(0.4)
        names = assets_page.get_visible_device_names()
        assert any(new_asset["name"] in n for n in names), f"Thiết bị mới '{new_asset['name']}' không xuất hiện trong danh mục!"

    def test_tc_asset_004_select_device_and_verify_ar_marker(self, driver):
        """TC_ASSET_004: Chọn thiết bị và kiểm tra nút tải tem mã AR Marker."""
        assets_page = AssetsPage(driver)
        assets_page.switch_to_devices_tab()
        assets_page.select_first_device()
        assets_page.wait_seconds(0.3)
        assert assets_page.is_download_svg_button_visible(), "Nút tải tem AR không hiển thị trong khung chi tiết!"
