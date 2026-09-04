from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional, Dict, Any, TYPE_CHECKING


if TYPE_CHECKING:
    from .base_entity import BaseEntity
    from .server_node import ServerNode
    from .rack import Rack
    from .alert import Alert
    from .ticket import MaintenanceTicket
    from .user_account import UserAccount


T = TypeVar("T")


# ============================================================
# BASE REPOSITORY
# ============================================================

class IBaseRepository(Generic[T], ABC):

    @abstractmethod
    def add(self, entity: T) -> T:
        pass

    @abstractmethod
    def get_by_id(self, entity_id: str) -> Optional[T]:
        pass

    @abstractmethod
    def list(
        self,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[T]:
        pass

    @abstractmethod
    def update(self, entity: T) -> T:
        pass

    @abstractmethod
    def delete(self, entity_id: str) -> bool:
        pass


# ============================================================
# SERVER NODE REPOSITORY
# ============================================================

class INodeRepository(IBaseRepository["ServerNode"], ABC):

    @abstractmethod
    def get_by_qr_code(
        self,
        qr_payload: str
    ) -> Optional["ServerNode"]:
        pass

    @abstractmethod
    def list_by_rack(
        self,
        rack_id: str
    ) -> List["ServerNode"]:
        pass


# ============================================================
# RACK REPOSITORY
# ============================================================

class IRackRepository(IBaseRepository["Rack"], ABC):

    @abstractmethod
    def get_by_code(
        self,
        code: str
    ) -> Optional["Rack"]:
        pass


# ============================================================
# ALERT REPOSITORY
# ============================================================

class IAlertRepository(IBaseRepository["Alert"], ABC):

    @abstractmethod
    def list_active(self) -> List["Alert"]:
        pass

    @abstractmethod
    def list_by_node(
        self,
        node_id: str
    ) -> List["Alert"]:
        pass


# ============================================================
# MAINTENANCE TICKET REPOSITORY
# ============================================================

class ITicketRepository(
    IBaseRepository["MaintenanceTicket"],
    ABC
):

    @abstractmethod
    def list_by_technician(
        self,
        technician_id: str
    ) -> List["MaintenanceTicket"]:
        pass

    @abstractmethod
    def list_by_status(
        self,
        status: str
    ) -> List["MaintenanceTicket"]:
        pass


# ============================================================
# USER REPOSITORY
# ============================================================

class IUserRepository(
    IBaseRepository["UserAccount"],
    ABC
):

    @abstractmethod
    def get_by_email(
        self,
        email: str
    ) -> Optional["UserAccount"]:
        pass

    @abstractmethod
    def list_pending(
        self
    ) -> List["UserAccount"]:
        pass