"""
Configuration module for AR-IMMS Selenium Automation Tests.
Supports environment variable overrides.
"""
import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent
REPORTS_DIR = BASE_DIR / "reports"
SCREENSHOTS_DIR = REPORTS_DIR / "screenshots"

# Ensure directories exist
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

# Application URL & Network Settings
BASE_URL = os.getenv("TEST_BASE_URL", "http://localhost:9999")
DEFAULT_TIMEOUT = int(os.getenv("TEST_TIMEOUT", "12"))
SHORT_TIMEOUT = int(os.getenv("TEST_SHORT_TIMEOUT", "4"))
LONG_TIMEOUT = int(os.getenv("TEST_LONG_TIMEOUT", "20"))
POLL_FREQUENCY = 0.3

# Browser Settings
BROWSER = os.getenv("TEST_BROWSER", "chrome").lower()
HEADLESS = os.getenv("TEST_HEADLESS", "false").lower() in ("true", "1", "yes")
WINDOW_WIDTH = 1920
WINDOW_HEIGHT = 1080

# Default Test Accounts
DEFAULT_ADMIN_EMAIL = os.getenv("TEST_ADMIN_EMAIL", "sjenkins@ar-imms.corp")
DEFAULT_ADMIN_PASSWORD = os.getenv("TEST_ADMIN_PASSWORD", "AdminPass123!")
DEFAULT_ADMIN_NAME = "Sarah Jenkins"

DEFAULT_TECH_EMAIL = os.getenv("TEST_TECH_EMAIL", "tbui@ar-imms.corp")
DEFAULT_TECH_PASSWORD = os.getenv("TEST_TECH_PASSWORD", "TechPass123!")
DEFAULT_TECH_NAME = "Trần Văn Bình"

DEFAULT_OPERATOR_EMAIL = os.getenv("TEST_OPERATOR_EMAIL", "operator@ar-imms.corp")
DEFAULT_OPERATOR_PASSWORD = os.getenv("TEST_OPERATOR_PASSWORD", "OperatorPass123!")
