#!/usr/bin/env python3
"""
CLI Test Runner script for AR-IMMS Selenium Automation Suite.

Usage examples:
    python run_tests.py
    python run_tests.py --headless
    python run_tests.py --suite auth
    python run_tests.py --base-url http://localhost:5173
"""
import sys
import argparse
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
REPORTS_DIR = BASE_DIR / "reports"
REPORT_FILE = REPORTS_DIR / "report.html"

SUITE_MAP = {
    "auth": "test_01_auth.py",
    "nav": "test_02_navigation.py",
    "assets": "test_03_assets.py",
    "tickets": "test_04_tickets.py",
    "alerts": "test_05_alerts.py",
    "users": "test_06_users_admin.py",
    "telemetry": "test_07_telemetry.py",
    "twin": "test_08_digital_twin_3d.py",
    "digital_twin": "test_08_digital_twin_3d.py",
    "analytics": "test_09_analytics.py",
    "audit": "test_10_audit_logs.py",
    "all": ""
}


def parse_args():
    parser = argparse.ArgumentParser(description="AR-IMMS Selenium Test Runner")
    parser.add_argument(
        "--headless",
        action="store_true",
        help="Execute browser in headless mode"
    )
    parser.add_argument(
        "--suite",
        choices=list(SUITE_MAP.keys()),
        default="all",
        help="Specify which test suite to run"
    )
    parser.add_argument(
        "--base-url",
        default="http://localhost:9999",
        help="Target base URL of AR-IMMS application"
    )
    parser.add_argument(
        "-k",
        "--keyword",
        help="Run tests matching the given keyword expression"
    )
    return parser.parse_args()


def main():
    args = parse_args()
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    pytest_cmd = [
        sys.executable, "-m", "pytest",
        "-v",
        f"--html={REPORT_FILE}",
        "--self-contained-html"
    ]

    if args.headless:
        pytest_cmd.append("--headless")

    if args.base_url:
        pytest_cmd.extend(["--base-url", args.base_url])

    if args.keyword:
        pytest_cmd.extend(["-k", args.keyword])

    # Target test file or directory
    target_suite = SUITE_MAP.get(args.suite, "")
    if target_suite:
        pytest_cmd.append(str(BASE_DIR / "tests" / target_suite))
    else:
        pytest_cmd.append(str(BASE_DIR / "tests"))

    print(f"\n🚀 Đang khởi chạy AR-IMMS Selenium Automation Suite...")
    print(f"📌 Lệnh thực thi: {' '.join(pytest_cmd)}\n")

    exit_code = subprocess.run(pytest_cmd, cwd=str(BASE_DIR.parent)).returncode

    print(f"\n{'='*60}")
    if exit_code == 0:
        print("✅ Tất cả các kịch bản kiểm thử đã chạy THÀNH CÔNG!")
    else:
        print(f"⚠️ Kiểm thử hoàn tất với mã trạng thái: {exit_code}")
    print(f"📄 Báo cáo HTML đã được tạo tại: {REPORT_FILE}")
    print(f"{'='*60}\n")

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
