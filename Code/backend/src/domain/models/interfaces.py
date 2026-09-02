from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional, Dict, Any
from .base_entity import BaseEntity
from .server_node import ServerNode
from .rack import Rack
from .alert import Alert
from .ticket import MaintenanceTicket
from .user_account import UserAccount

T = TypeVar("T", bound=BaseEntity)


class IBaseRepository(Generic[T], ABC):
    """
    Interface mẫu chuẩn định nghĩa toàn bộ thao tác CRUD cơ bản cho Domain Entities.
    Áp dụng nguyên lý Trừu tượng hóa (Abstraction) và Đa hình (Polymorphism).
    """

    @abstractmethod
    def add(self, entity: T) -> T:
        """Tạo mới một thực thể (Create)."""
        pass

    @abstractmethod
    def get_by_id(self, entity_id: str) -> Optional[T]:
        """Lấy một thực thể theo khóa chính ID (Read by ID)."""
        pass

    @abstractmethod
    def list(self, filters: Optional[Dict[str, Any]] = None) -> List[T]:
        """Lấy danh sách các thực thể kèm bộ lọc tùy chọn (Read List)."""
        pass

    @abstractmethod
    def update(self, entity: T) -> T:
        """Cập nhật thông tin thực thể (Update)."""
        pass

    @abstractmethod
    def delete(self, entity_id: str) -> bool:
        """Xóa thực thể theo ID (Delete)."""
        pass


class INodeRepository(IBaseRepository[ServerNode]):
    """Interface mở rộng dành riêng cho ServerNode."""

    @abstractmethod
    def get_by_qr_code(self, qr_payload: str) -> Optional[ServerNode]:
        """Tra cứu node thông qua mã QR quét từ thiết bị AR."""
        pass

    @abstractmethod
    def list_by_rack(self, rack_id: str) -> List[ServerNode]:
        """Lấy danh sách các node được lắp đặt trong một tủ rack cụ thể."""
        pass


class IRackRepository(IBaseRepository[Rack]):
    """Interface mở rộng dành riêng cho Tủ Rack."""

    @abstractmethod
    def get_by_code(self, code: str) -> Optional[Rack]:
        """Tra cứu tủ rack theo mã code (ví dụ: 'RACK-A1')."""
        pass


class IAlertRepository(IBaseRepository[Alert]):
    """Interface mở rộng dành riêng cho Cảnh báo."""

    @abstractmethod
    def list_active(self) -> List[Alert]:
        """Lấy danh sách các cảnh báo đang mở (OPEN hoặc ACKNOWLEDGED)."""
        pass

    @abstractmethod
    def list_by_node(self, node_id: str) -> List[Alert]:
        """Lấy danh sách cảnh báo của một server node cụ thể."""
        pass


class ITicketRepository(IBaseRepository[MaintenanceTicket]):
    """Interface mở rộng dành riêng cho Phiếu bảo trì."""

    @abstractmethod
    def list_by_technician(self, technician_id: str) -> List[MaintenanceTicket]:
        """Lấy danh sách phiếu được phân công cho một kỹ thuật viên."""
        pass

    @abstractmethod
    def list_by_status(self, status: str) -> List[MaintenanceTicket]:
        """Lọc danh sách phiếu theo trạng thái."""
        pass


class IUserRepository(IBaseRepository[UserAccount]):
    """Interface mở rộng dành riêng cho Tài khoản người dùng."""

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[UserAccount]:
        """Tra cứu tài khoản theo email đăng nhập."""
        pass

    @abstractmethod
    def list_pending(self) -> List[UserAccount]:
        """Lấy danh sách tài khoản kỹ thuật viên đang chờ phê duyệt."""
        pass
