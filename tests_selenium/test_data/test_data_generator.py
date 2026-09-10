"""
Dynamic test data generator to ensure test case isolation and avoid race conditions or duplicate entries.
"""
import uuid
import time
import random
try:
    from faker import Faker
    fake = Faker("vi_VN")
except ImportError:
    class FakeFallback:
        def name(self):
            return f"Technician_{random.randint(100, 999)}"
        def email(self):
            return f"tech_{int(time.time())}_{random.randint(10, 99)}@ar-imms.corp"
        def company(self):
            return "Enterprise Solutions"
        def sentence(self):
            return "Kiem tra qua nhiet node may chu va luong gio lam mat."
    fake = FakeFallback()


def generate_random_user(role="Technician"):
    """Generate unique user credentials for registration/login testing."""
    ts = int(time.time())
    rand_id = random.randint(1000, 9999)
    name = f"Test Tech {rand_id}"
    email = f"user_{ts}_{rand_id}@ar-imms.corp"
    employee_id = f"TECH-{rand_id}"
    password = f"SecurePass@{rand_id}"
    return {
        "name": name,
        "email": email,
        "employee_id": employee_id,
        "password": password,
        "role": role
    }


def generate_random_asset(rack="Rack A1"):
    """Generate dynamic server/hardware asset data."""
    unique_suffix = f"{int(time.time()) % 10000:04d}"
    u_start = random.randint(1, 38)
    return {
        "name": f"SRV-AUTOTEST-{unique_suffix}",
        "model": f"EdgeServer Gen{random.randint(10, 15)}",
        "rack": rack,
        "uPosition": f"U{u_start:02d}-{u_start+1:02d}",
        "manufacturer": "Supermicro Enterprise",
        "serialNumber": f"SN-TEST-{uuid.uuid4().hex[:8].upper()}",
        "powerDraw": f"{random.randint(350, 750)}W",
        "ipAddress": f"10.0.{random.randint(1, 20)}.{random.randint(10, 250)}"
    }


def generate_random_ticket(node_name="Node-Alpha-01"):
    """Generate dynamic maintenance ticket data."""
    rand_code = random.randint(1000, 9999)
    return {
        "title": f"[AutoTest] Kiểm tra cảnh báo nhiệt độ khẩn cấp #{rand_code}",
        "description": f"Phát hiện cảnh báo chỉ số IPMI vượt ngưỡng. Cần cử kỹ thuật viên dùng AR quét và rà soát cụm tản nhiệt. Mã kiểm thử: {rand_code}",
        "priority": random.choice(["CRITICAL", "HIGH", "MEDIUM"]),
        "node_name": node_name
    }
