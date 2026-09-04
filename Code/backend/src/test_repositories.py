from infrastructure.repositories.ar_repositories import (
    NodeRepository,
    RackRepository,
    AlertRepository,
    TicketRepository,
    UserRepository,
)

print("=" * 70)
print("          TEST REPOSITORIES - SUPABASE")
print("=" * 70)


# ============================================================
# 1. USER REPOSITORY
# ============================================================

print("\n[1] USER REPOSITORY")

try:
    user_repo = UserRepository()

    users = user_repo.list()

    print(f"So luong users: {len(users)}")

    for user in users:
        print(
            f"- {user.email} | "
            f"{user.full_name} | "
            f"{user.role} | "
            f"{user.status}"
        )

    admin = user_repo.get_by_email(
        "admin@ar-imms.dc"
    )

    if admin:
        print("\nTim admin thanh cong:")
        print(
            f"{admin.email} | "
            f"{admin.full_name} | "
            f"{admin.role} | "
            f"{admin.status}"
        )
    else:
        print("\nKhong tim thay admin.")

except Exception as e:
    print("\nUSER REPOSITORY FAILED")
    print("Loai loi:", type(e).__name__)
    print("Chi tiet:", e)


# ============================================================
# 2. SERVER NODE REPOSITORY
# ============================================================

print("\n[2] SERVER NODE REPOSITORY")

try:
    node_repo = NodeRepository()

    nodes = node_repo.list()

    print(f"So luong server nodes: {len(nodes)}")

    for node in nodes:
        print(
            f"- {node.id} | "
            f"{node.name} | "
            f"{node.ip_address} | "
            f"{node.status}"
        )

except Exception as e:
    print("\nSERVER NODE REPOSITORY FAILED")
    print("Loai loi:", type(e).__name__)
    print("Chi tiet:", e)


# ============================================================
# 3. RACK REPOSITORY
# ============================================================

print("\n[3] RACK REPOSITORY")

try:
    rack_repo = RackRepository()

    racks = rack_repo.list()

    print(f"So luong racks: {len(racks)}")

    for rack in racks:
        print(
            f"- {rack.code} | "
            f"{rack.name}"
        )

except Exception as e:
    print("\nRACK REPOSITORY FAILED")
    print("Loai loi:", type(e).__name__)
    print("Chi tiet:", e)


# ============================================================
# 4. ALERT REPOSITORY
# ============================================================

print("\n[4] ALERT REPOSITORY")

try:
    alert_repo = AlertRepository()

    alerts = alert_repo.list()

    print(f"So luong alerts: {len(alerts)}")

    for alert in alerts:
        print(
            f"- {alert.id} | "
            f"{alert.title} | "
            f"{alert.severity} | "
            f"{alert.status}"
        )

    active_alerts = alert_repo.list_active()

    print(
        f"Active alerts: "
        f"{len(active_alerts)}"
    )

except Exception as e:
    print("\nALERT REPOSITORY FAILED")
    print("Loai loi:", type(e).__name__)
    print("Chi tiet:", e)


# ============================================================
# 5. MAINTENANCE TICKET REPOSITORY
# ============================================================

print("\n[5] MAINTENANCE TICKET REPOSITORY")

try:
    ticket_repo = TicketRepository()

    tickets = ticket_repo.list()

    print(
        f"So luong maintenance tickets: "
        f"{len(tickets)}"
    )

    for ticket in tickets:
        print(
            f"- {ticket.id} | "
            f"{ticket.title} | "
            f"{ticket.priority} | "
            f"{ticket.status}"
        )

except Exception as e:
    print("\nTICKET REPOSITORY FAILED")
    print("Loai loi:", type(e).__name__)
    print("Chi tiet:", e)


# ============================================================
# FINISHED
# ============================================================

print("\n" + "=" * 70)
print("             REPOSITORY TEST FINISHED")
print("=" * 70)