from abc import ABC
from datetime import datetime
from typing import Dict, Any, Optional


class BaseEntity(ABC):
    """
    Lớp cơ sở trừu tượng cho tất cả Domain Entities trong hệ thống AR-IMMS.
    Áp dụng nguyên lý đóng gói (Encapsulation) và kế thừa (Inheritance).
    """

    def __init__(self, id: Optional[str] = None, created_at: Optional[datetime] = None, updated_at: Optional[datetime] = None):
        self._id = id
        self._created_at = created_at or datetime.utcnow()
        self._updated_at = updated_at or datetime.utcnow()

    @property
    def id(self) -> Optional[str]:
        return self._id

    @id.setter
    def id(self, value: str):
        if not value or not str(value).strip():
            raise ValueError("ID không được để trống")
        self._id = str(value).strip()

    @property
    def created_at(self) -> datetime:
        return self._created_at

    @property
    def updated_at(self) -> datetime:
        return self._updated_at

    def touch(self):
        """Cập nhật thời gian sửa đổi gần nhất."""
        self._updated_at = datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        """Chuyển đổi entity thành dictionary (hỗ trợ serialization)."""
        return {
            "id": self._id,
            "created_at": self._created_at.isoformat() if self._created_at else None,
            "updated_at": self._updated_at.isoformat() if self._updated_at else None,
        }
