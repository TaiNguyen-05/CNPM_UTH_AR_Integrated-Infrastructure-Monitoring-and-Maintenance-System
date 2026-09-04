from infrastructure.databases.db_session import db_session
from infrastructure.models.ar_models import UserModel, ServerNodeModel


print("=== TEST SQLALCHEMY MODELS ===")

session = db_session()

try:
    users = session.query(UserModel).limit(3).all()

    print()
    print("USERS:")

    for user in users:
        print(
            f"- {user.email} | "
            f"{user.full_name} | "
            f"{user.role} | "
            f"{user.status}"
        )

    nodes = session.query(ServerNodeModel).limit(3).all()

    print()
    print("SERVER NODES:")

    for node in nodes:
        print(
            f"- {node.id} | "
            f"{node.name} | "
            f"{node.status}"
        )

    print()
    print("=== MODEL TEST SUCCESS ===")

except Exception as e:
    print()
    print("=== MODEL TEST FAILED ===")
    print(type(e).__name__)
    print(e)

finally:
    session.close()