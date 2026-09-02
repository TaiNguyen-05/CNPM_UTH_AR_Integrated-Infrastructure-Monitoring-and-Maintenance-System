import re
from datetime import datetime
from typing import Dict, Any, Optional
from .base_entity import BaseEntity


class UserAccount(BaseEntity):
    """
    Domain Entity đại diện cho Tài khoản người dùng và phân quyền RBAC.
    """

    VALID_ROLES = {"ADMIN", "OPERATOR", "TECHNICIAN"}
    VALID_STATUSES = {"PENDING_APPROVAL", "APPROVED", "LOCKED", "REJECTED"}

    def __init__(
        self,
        id: str,
        email: str,
        full_name: str,
        role: str = "TECHNICIAN",
        status: str = "PENDING_APPROVAL",
        phone_number: Optional[str] = None,
        department: Optional[str] = "Infrastructure Ops",
        avatar: Optional[str] = None,
        password_hash: Optional[str] = None,
        approved_by: Optional[str] = None,
        approved_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        super().__init__(id=id, created_at=created_at, updated_at=updated_at)
        self.email = email
        self.full_name = full_name
        self.role = role
        self.status = status
        self._phone_number = phone_number
        self._department = department
        self._avatar = avatar or (full_name[:2].upper() if full_name else "US")
        self._password_hash = password_hash
        self._approved_by = approved_by
        self._approved_at = approved_at

    @property
    def email(self) -> str:
        return self._email

    @email.setter
    def email(self, value: str):
        if not value or not re.match(r"^[^@]+@[^@]+\.[^@]+$", str(value).strip()):
            raise ValueError(f"Định dạng email không hợp lệ: {value}")
        self._email = str(value).strip().lower()
        self.touch()

    @property
    def full_name(self) -> str:
        return self._full_name

    @full_name.setter
    def full_name(self, value: str):
        if not value or len(str(value).strip()) < 2:
            raise ValueError("Họ tên phải có ít nhất 2 ký tự")
        self._full_name = str(value).strip()
        self.touch()

    @property
    def role(self) -> str:
        return self._role

    @role.setter
    def role(self, value: str):
        val = str(value).upper().strip()
        if val not in self.VALID_ROLES:
            raise ValueError(f"Vai trò {value} không hợp lệ. Cho phép: {self.VALID_ROLES}")
        self._role = val
        self.touch()

    @property
    def status(self) -> str:
        return self._status

    @status.setter
    def status(self, value: str):
        val = str(value).upper().strip()
        if val not in self.VALID_STATUSES:
            raise ValueError(f"Trạng thái {value} không hợp lệ. Cho phép: {self.VALID_STATUSES}")
        self._status = val
        self.touch()

    # --- Domain Business Methods ---

    def approve(self, approver_id: str):
        """Quản trị viên phê duyệt tài khoản kỹ thuật viên."""
        self._status = "APPROVED"
        self._approved_by = approver_id
        self._approved_at = datetime.utcnow()
        self.touch()

    def lock(self):
        """Khóa quyền truy cập của tài khoản."""
        self._status = "LOCKED"
        self.touch()

    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "email": self._email,
            "full_name": self._full_name,
            "role": self._role,
            "status": self._status,
            "phone_number": self._phone_number,
            "department": self._department,
            "avatar": self._avatar,
            "approved_by": self._approved_by,
            "approved_at": self._approved_at.isoformat() if self._approved_at else None,
        })
        return data
