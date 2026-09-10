"""
Pytest configuration and global fixtures for AR-IMMS Selenium Tests.
Includes WebDriver lifecycle management, automatic failure screenshot hooks, and HTML report formatting.
"""
import os
import sys
import time
import pytest
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from webdriver_manager.chrome import ChromeDriverManager

try:
    from .config import (
        BASE_URL,
        HEADLESS,
        WINDOW_WIDTH,
        WINDOW_HEIGHT,
        SCREENSHOTS_DIR,
        REPORTS_DIR
    )
except (ImportError, ValueError):
    from tests_selenium.config import (
        BASE_URL,
        HEADLESS,
        WINDOW_WIDTH,
        WINDOW_HEIGHT,
        SCREENSHOTS_DIR,
        REPORTS_DIR
    )


def pytest_addoption(parser):
    """Add custom CLI arguments for pytest."""
    parser.addoption(
        "--headless",
        action="store_true",
        default=HEADLESS,
        help="Run browser in headless mode"
    )
    parser.addoption(
        "--base-url",
        action="store",
        default=BASE_URL,
        help="Base URL of the AR-IMMS application"
    )


@pytest.fixture(scope="session")
def base_url(request):
    """Fixture returning the target base URL."""
    return request.config.getoption("--base-url")


@pytest.fixture(scope="function")
def driver(request):
    """
    Function-scoped fixture creating a fresh WebDriver instance for each test case
    to guarantee complete test isolation.
    """
    is_headless = request.config.getoption("--headless")

    chrome_options = ChromeOptions()
    if is_headless:
        chrome_options.add_argument("--headless=new")
    chrome_options.add_argument(f"--window-size={WINDOW_WIDTH},{WINDOW_HEIGHT}")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--ignore-certificate-errors")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option("useAutomationExtension", False)

    # Automatically install and configure matching ChromeDriver
    service = ChromeService(ChromeDriverManager().install())
    web_driver = webdriver.Chrome(service=service, options=chrome_options)
    web_driver.set_page_load_timeout(30)

    # Attach driver to pytest item for failure screenshot hook
    request.node.driver = web_driver

    yield web_driver

    # Teardown
    try:
        web_driver.quit()
    except Exception:
        pass


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """
    Hook to capture screenshot on test failure and embed directly into pytest-html report.
    """
    outcome = yield
    report = outcome.get_result()
    extra = getattr(report, "extra", [])

    if report.when == "call" and report.failed:
        web_driver = getattr(item, "driver", None)
        if web_driver:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            test_name = item.name.replace("/", "_").replace(":", "_")
            screenshot_file = SCREENSHOTS_DIR / f"FAIL_{test_name}_{timestamp}.png"
            try:
                web_driver.save_screenshot(str(screenshot_file))
                # Add screenshot link/image to pytest-html if available
                pytest_html = item.config.pluginmanager.getplugin("html")
                if pytest_html:
                    html_extra = pytest_html.extras.image(str(screenshot_file))
                    extra.append(html_extra)
            except Exception as e:
                print(f"[conftest] Screenshot capture error: {e}", file=sys.stderr)

    report.extra = extra


def pytest_html_report_title(report):
    """Customize pytest-html title."""
    report.title = "AR-IMMS Industrial Infrastructure - Selenium Test Report"
