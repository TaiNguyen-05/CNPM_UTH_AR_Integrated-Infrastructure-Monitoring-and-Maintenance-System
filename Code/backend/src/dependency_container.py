"""
Dependency Injection Container thuần OOP (Zero external dependencies).
Áp dụng Design Patterns:
- Singleton Pattern: cho Repository instances và Container.
- Factory Pattern: cho Service creation và injection.
- Dependency Inversion Principle (DIP): Services phụ thuộc vào Abstract Interfaces.
"""

from typing import Dict, Any
from infrastructure.repositories.ar_repositories import (
    NodeRepository, RackRepository, AlertRepository, TicketRepository, UserRepository
)
from services.ar_services import (
    NodeService, RackService, AlertService, TicketService, UserService
)


class Container:
    """
    IoC / DI Container quản lý việc khởi tạo và cung cấp các Repositories & Services.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Container, cls).__new__(cls)
            cls._instance._init_dependencies()
        return cls._instance

    def _init_dependencies(self):
        # Repositories (Singletons)
        self._node_repository = NodeRepository()
        self._rack_repository = RackRepository()
        self._alert_repository = AlertRepository()
        self._ticket_repository = TicketRepository()
        self._user_repository = UserRepository()

        # Services (Factories with Injected Repositories)
        self._node_service = NodeService(self._node_repository)
        self._rack_service = RackService(self._rack_repository)
        self._alert_service = AlertService(self._alert_repository)
        self._ticket_service = TicketService(self._ticket_repository)
        self._user_service = UserService(self._user_repository)

    # --- Public Accessor Properties ---

    @property
    def node_repository(self) -> NodeRepository:
        return self._node_repository

    @property
    def rack_repository(self) -> RackRepository:
        return self._rack_repository

    @property
    def alert_repository(self) -> AlertRepository:
        return self._alert_repository

    @property
    def ticket_repository(self) -> TicketRepository:
        return self._ticket_repository

    @property
    def user_repository(self) -> UserRepository:
        return self._user_repository

    @property
    def node_service(self) -> NodeService:
        return self._node_service

    @property
    def rack_service(self) -> RackService:
        return self._rack_service

    @property
    def alert_service(self) -> AlertService:
        return self._alert_service

    @property
    def ticket_service(self) -> TicketService:
        return self._ticket_service

    @property
    def user_service(self) -> UserService:
        return self._user_service