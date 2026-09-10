"""
Static fixture test data: pre-seeded user accounts, roles, sample device profiles.
"""

SAMPLE_ACCOUNTS = {
    "admin": {
        "email": "sjenkins@ar-imms.corp",
        "name": "Sarah Jenkins",
        "role": "Admin",
        "password": "Password123!"
    },
    "technician": {
        "email": "tbui@ar-imms.corp",
        "name": "Trần Văn Bình",
        "role": "Technician",
        "password": "Password123!"
    },
    "operator": {
        "email": "operator@ar-imms.corp",
        "name": "Operator Demo",
        "role": "Technician",
        "password": "Password123!"
    }
}

VALID_RACKS = ["Rack A1", "Rack A2", "Rack B1", "Rack B2", "Rack C1"]

SAMPLE_ASSETS = [
    {
        "name": "SRV-COMPUTE-A1-01",
        "model": "Dell PowerEdge R750",
        "rack": "Rack A1",
        "uPosition": "U01-02",
        "manufacturer": "Dell Technologies",
        "powerDraw": "450W"
    },
    {
        "name": "SW-CORE-EDGE-01",
        "model": "Cisco Catalyst 9300",
        "rack": "Rack B1",
        "uPosition": "U24-25",
        "manufacturer": "Cisco Systems",
        "powerDraw": "320W"
    }
]

TICKET_PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
TICKET_STATUSES = ["CREATED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"]
