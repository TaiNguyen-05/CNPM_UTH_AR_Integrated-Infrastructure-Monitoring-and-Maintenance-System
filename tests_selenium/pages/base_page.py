"""
Base Page implementing common Selenium WebDriver interactions with explicit waits,
safe clicks, scrolling, and error handling.
"""
import time
from typing import List, Tuple
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    ElementClickInterceptedException,
    StaleElementReferenceException
)

from ..config import DEFAULT_TIMEOUT, SHORT_TIMEOUT, POLL_FREQUENCY


class BasePage:
    """Base class for all Page Objects in the POM architecture."""

    def __init__(self, driver: WebDriver, timeout: int = DEFAULT_TIMEOUT):
        self.driver = driver
        self.timeout = timeout
        self.wait = WebDriverWait(self.driver, self.timeout, poll_frequency=POLL_FREQUENCY)
        self.short_wait = WebDriverWait(self.driver, SHORT_TIMEOUT, poll_frequency=POLL_FREQUENCY)

    def navigate_to(self, url: str) -> None:
        """Navigate to a target URL."""
        self.driver.get(url)

    def get_current_url(self) -> str:
        """Return the current page URL."""
        return self.driver.current_url

    def find_element(self, locator: Tuple[str, str], timeout: int = None) -> WebElement:
        """Find single element with explicit wait."""
        wait_obj = self.wait if timeout is None else WebDriverWait(self.driver, timeout, poll_frequency=POLL_FREQUENCY)
        return wait_obj.until(EC.presence_of_element_located(locator))

    def find_elements(self, locator: Tuple[str, str], timeout: int = None) -> List[WebElement]:
        """Find list of elements with explicit wait."""
        wait_obj = self.wait if timeout is None else WebDriverWait(self.driver, timeout, poll_frequency=POLL_FREQUENCY)
        try:
            return wait_obj.until(EC.presence_of_all_elements_located(locator))
        except TimeoutException:
            return []

    def click(self, locator: Tuple[str, str], timeout: int = None) -> None:
        """Click element safely with retry on click-intercepted."""
        wait_obj = self.wait if timeout is None else WebDriverWait(self.driver, timeout, poll_frequency=POLL_FREQUENCY)
        element = wait_obj.until(EC.element_to_be_clickable(locator))
        try:
            element.click()
        except ElementClickInterceptedException:
            # Scroll into view and retry via JavaScript
            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
            time.sleep(0.2)
            try:
                element.click()
            except Exception:
                self.driver.execute_script("arguments[0].click();", element)

    def type_text(self, locator: Tuple[str, str], text: str, clear_first: bool = True) -> None:
        """Type text into an input element."""
        element = self.find_element(locator)
        if clear_first:
            element.clear()
        element.send_keys(text)

    def get_text(self, locator: Tuple[str, str]) -> str:
        """Get visible text from an element."""
        element = self.wait.until(EC.visibility_of_element_located(locator))
        return element.text.strip()

    def is_visible(self, locator: Tuple[str, str], timeout: int = SHORT_TIMEOUT) -> bool:
        """Check whether element is visible within the given timeout."""
        try:
            WebDriverWait(self.driver, timeout, poll_frequency=POLL_FREQUENCY).until(
                EC.visibility_of_element_located(locator)
            )
            return True
        except (TimeoutException, NoSuchElementException):
            return False

    def is_invisible(self, locator: Tuple[str, str], timeout: int = SHORT_TIMEOUT) -> bool:
        """Check whether element disappears or is absent."""
        try:
            WebDriverWait(self.driver, timeout, poll_frequency=POLL_FREQUENCY).until(
                EC.invisibility_of_element_located(locator)
            )
            return True
        except TimeoutException:
            return False

    def select_by_value(self, locator: Tuple[str, str], value: str) -> None:
        """Select HTML dropdown option by value."""
        element = self.find_element(locator)
        select = Select(element)
        select.select_by_value(value)

    def select_by_visible_text(self, locator: Tuple[str, str], text: str) -> None:
        """Select HTML dropdown option by visible text."""
        element = self.find_element(locator)
        select = Select(element)
        select.select_by_visible_text(text)

    def scroll_to_element(self, locator: Tuple[str, str]) -> None:
        """Scroll page to bring element into view."""
        element = self.find_element(locator)
        self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)

    def take_screenshot(self, filepath: str) -> bool:
        """Capture screenshot to specified filepath."""
        return self.driver.save_screenshot(filepath)

    def wait_seconds(self, seconds: float) -> None:
        """Explicit sleep when required for CSS animations."""
        time.sleep(seconds)
