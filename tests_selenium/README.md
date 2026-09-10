# Hướng Dẫn Sử Dụng Bộ Test Automation Selenium (AR-IMMS)

Bộ kiểm thử tự động toàn diện được xây dựng cho hệ thống **AR-IMMS** bằng **Python + Selenium WebDriver 4.x + Pytest** theo mô hình **Page Object Model (POM)** chuẩn doanh nghiệp.

---

## 1. Cài Đặt Môi Trường

Cài đặt các thư viện kiểm thử cần thiết:
```bash
pip install -r tests_selenium/requirements-test.txt
```

*(Lưu ý: Thư viện `webdriver-manager` sẽ tự động tải và cài đặt ChromeDriver tương thích với phiên bản Chrome trên máy tính của bạn).*

---

## 2. Chuẩn Bị Ứng Dụng

Đảm bảo ứng dụng frontend (và backend nếu cần) đang chạy:
```bash
# Terminal: Chạy Frontend Vite
cd Code/frontend
npm run dev
# -> http://localhost:5173
```

---

## 3. Chạy Kiểm Thử (Test Execution)

### Cách 1: Sử dụng Runner Script Tiện Ích (`run_tests.py`)
```bash
# Chạy toàn bộ 10 test suites (chế độ có giao diện trực quan):
python tests_selenium/run_tests.py

# Chạy ở chế độ ngầm (Headless mode):
python tests_selenium/run_tests.py --headless

# Chạy riêng từng module:
python tests_selenium/run_tests.py --suite auth
python tests_selenium/run_tests.py --suite nav
python tests_selenium/run_tests.py --suite assets
python tests_selenium/run_tests.py --suite tickets
python tests_selenium/run_tests.py --suite alerts
python tests_selenium/run_tests.py --suite users
python tests_selenium/run_tests.py --suite telemetry
python tests_selenium/run_tests.py --suite twin
python tests_selenium/run_tests.py --suite analytics
python tests_selenium/run_tests.py --suite audit

# Chạy với Base URL tùy biến:
python tests_selenium/run_tests.py --base-url http://localhost:5173
```

### Cách 2: Sử dụng Trực Tiếp CLI `pytest`
```bash
# Chạy tất cả test cases và xuất báo cáo HTML:
pytest tests_selenium/tests/ -v --html=tests_selenium/reports/report.html --self-contained-html

# Chạy riêng 1 file test:
pytest tests_selenium/tests/test_04_tickets.py -v
pytest tests_selenium/tests/test_08_digital_twin_3d.py -v
pytest tests_selenium/tests/test_09_analytics.py -v
pytest tests_selenium/tests/test_10_audit_logs.py -v

# Chạy với cờ headless:
pytest tests_selenium/tests/ -v --headless
```

---

## 4. Danh Sách 10 Module Kiểm Thử (Test Suites)

| STT | Suite | Tên File | Chức Năng Kiểm Thử |
|---|---|---|---|
| 01 | **Auth** | `test_01_auth.py` | Đăng nhập, Đăng ký, Validate form & Bảo mật |
| 02 | **Navigation** | `test_02_navigation.py` | Điều hướng Sidebar, Chuyển tab & Header |
| 03 | **Assets & QR** | `test_03_assets.py` | Quản lý tủ rack, linh kiện, tạo mã QR AR |
| 04 | **Tickets & AR** | `test_04_tickets.py` | Tạo phiếu bảo trì, phân công KTV, ghi log AR, hoàn tất & đóng phiếu |
| 05 | **Alerts** | `test_05_alerts.py` | Giám sát sự cố, tiếp nhận (Acknowledge) & phân loại nghiêm trọng |
| 06 | **Users & RBAC** | `test_06_users_admin.py` | Quản lý người dùng, phân quyền Admin/KTV, duyệt tài khoản |
| 07 | **Telemetry** | `test_07_telemetry.py` | Luồng dữ liệu cảm biến thời gian thực, bật/tắt Stream |
| 08 | **Digital Twin** | `test_08_digital_twin_3d.py` | Mặt bằng Digital Twin 3D, Heatmap nhiệt độ, Fan boost |
| 09 | **Analytics & PUE** | `test_09_analytics.py` | Hiệu suất PUE, phụ tải điện IT, lọc mốc 24h/7d/30d & xuất CSV |
| 10 | **Audit Logs** | `test_10_audit_logs.py` | Bảng nhật ký kiểm toán bất biến, tìm kiếm & xuất CSV bảo mật |

---

## 5. Báo Cáo & Ảnh Chụp Lỗi (Reports & Artifacts)

- **Báo cáo HTML tổng quan**: `tests_selenium/reports/report.html`
- **Ảnh chụp màn hình khi có lỗi**: `tests_selenium/reports/screenshots/FAIL_<test_name>_<timestamp>.png` (được tự động nhúng vào báo cáo HTML).

---

## 6. Cấu Trúc Bộ Test (POM Architecture)

```
tests_selenium/
├── config.py                 # Cấu hình URL, Timeouts, Accounts mặc định
├── conftest.py               # Fixtures WebDriver, Hook chụp ảnh khi fail, Báo cáo HTML
├── requirements-test.txt     # Thư viện phụ thuộc
├── run_tests.py              # CLI Runner thông minh
├── locators/                 # Quản lý tập trung các bộ chọn phần tử (CSS/XPath)
├── pages/                    # Các lớp Page Object Model (POM)
├── test_data/                # Quản lý dữ liệu kiểm thử (Static + Dynamic Generator)
├── tests/                    # 10 Test Suites bao phủ 100% module chức năng
└── reports/                  # Báo cáo HTML và Ảnh chụp lỗi
```

