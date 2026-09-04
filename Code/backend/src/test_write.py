from datetime import datetime, timezone
import uuid

from infrastructure.repositories.ar_repositories import AlertRepository
from domain.models.alert import Alert


print("=" * 70)
print("          TEST WRITE - SUPABASE")
print("=" * 70)


# ============================================================
# 1. KHỞI TẠO REPOSITORY
# ============================================================

alert_repo = AlertRepository()


# ============================================================
# 2. TẠO ALERT TEST
# ============================================================

test_alert_id = "TEST-ALERT-" + uuid.uuid4().hex[:8]

now = datetime.now(timezone.utc)

alert = Alert(
    id=test_alert_id,

    # Dùng Server Node có thật trong database
    server_node_id="SRV-NODE-01",

    title="TEST Alert - CPU High",

    message="This is a test alert created by repository write test.",

    severity="WARNING",

    metric_name="cpu_usage",

    metric_value=85.5,

    threshold_value=80.0,

    status="OPEN",

    acknowledged_by=None,
    acknowledged_at=None,

    resolved_by=None,
    resolved_at=None,

    created_at=now,
    updated_at=now,
)


# ============================================================
# 3. INSERT
# ============================================================

print("\n[1] INSERT ALERT")

try:

    created_alert = alert_repo.add(alert)

    print("INSERT SUCCESS!")
    print("ID:", created_alert.id)
    print("Title:", created_alert.title)
    print("Server Node:", created_alert.server_node_id)
    print("Severity:", created_alert.severity)
    print("Status:", created_alert.status)

except Exception as e:

    print("INSERT FAILED")
    print("Loai loi:", type(e).__name__)
    print("Chi tiet:", e)

    raise


# ============================================================
# 4. READ LẠI DỮ LIỆU VỪA INSERT
# ============================================================

print("\n[2] READ AFTER INSERT")

try:

    found_alert = alert_repo.get_by_id(test_alert_id)

    if found_alert:

        print("READ SUCCESS!")
        print("ID:", found_alert.id)
        print("Title:", found_alert.title)
        print("Message:", found_alert.message)
        print("Severity:", found_alert.severity)
        print("Metric:", found_alert.metric_name)
        print("Value:", found_alert.metric_value)
        print("Threshold:", found_alert.threshold_value)
        print("Status:", found_alert.status)

    else:

        print("READ FAILED")
        print("Khong tim thay alert vua tao.")

except Exception as e:

    print("READ FAILED")
    print("Loai loi:", type(e).__name__)
    print("Chi tiet:", e)

    raise


# ============================================================
# 5. KIỂM TRA LIST ACTIVE
# ============================================================

print("\n[3] LIST ACTIVE ALERTS")

try:

    active_alerts = alert_repo.list_active()

    print("So luong active alerts:", len(active_alerts))

    for item in active_alerts:

        print(
            "-",
            item.id,
            "|",
            item.title,
            "|",
            item.status
        )

except Exception as e:

    print("LIST ACTIVE FAILED")
    print("Loai loi:", type(e).__name__)
    print("Chi tiet:", e)

    raise


# ============================================================
# 6. DELETE ALERT TEST
# ============================================================

print("\n[4] DELETE TEST ALERT")

try:

    deleted = alert_repo.delete(test_alert_id)

    if deleted:

        print("DELETE SUCCESS!")

    else:

        print("DELETE FAILED")
        print("Khong tim thay alert de xoa.")

except Exception as e:

    print("DELETE FAILED")
    print("Loai loi:", type(e).__name__)
    print("Chi tiet:", e)

    raise


# ============================================================
# 7. KIỂM TRA LẠI SAU KHI DELETE
# ============================================================

print("\n[5] VERIFY DELETE")

try:

    deleted_alert = alert_repo.get_by_id(test_alert_id)

    if deleted_alert is None:

        print("VERIFY DELETE SUCCESS!")
        print("Alert test da duoc xoa khoi database.")

    else:

        print("VERIFY DELETE FAILED")
        print("Alert test van con trong database.")

except Exception as e:

    print("VERIFY DELETE FAILED")
    print("Loai loi:", type(e).__name__)
    print("Chi tiet:", e)

    raise


# ============================================================
# FINISHED
# ============================================================

print("\n" + "=" * 70)
print("             WRITE TEST FINISHED")
print("=" * 70)