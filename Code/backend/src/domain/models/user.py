from datetime import datetime
from typing import Optional

from domain.models.base_entity import BaseEntity


class UserAccount(BaseEntity):

    VALID_ROLES = {
        "ADMIN",
        "OPERATOR",
        "TECHNICIAN",
    }

    VALID_STATUSES = {
        "PENDING_APPROVAL",
        "APPROVED",
        "LOCKED",
        "REJECTED",
    }

    def __init__(
        self,
        id: str,
        email: str,
        full_name: str,
        role: str,
        status: str,
        phone_number: Optional[str] = None,
        department: Optional[str] = None,
        avatar: Optional[str] = None,
        password_hash: Optional[str] = None,
        approved_by: Optional[str] = None,
        approved_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        super().__init__(
            id=id,
            created_at=created_at,
            updated_at=updated_at,
        )

        if role not in self.VALID_ROLES:
            raise ValueError(
                f"Role không hợp lệ: {role}. "
                f"Cho phép: {self.VALID_ROLES}"
            )

        if status not in self.VALID_STATUSES:
            raise ValueError(
                f"Status không hợp lệ: {status}. "
                f"Cho phép: {self.VALID_STATUSES}"
            )

        self.email = email
        self.full_name = full_name
        self.role = role
        self.status = status

        self._phone_number = phone_number
        self._department = department
        self._avatar = avatar
        self._password_hash = password_hash

        self._approved_by = approved_by
        self._approved_at = approved_at

    # ==========================================================
    # PROPERTIES
    # ==========================================================

    @property
    def phone_number(self) -> Optional[str]:
        return self._phone_number

    @phone_number.setter
    def phone_number(self, value: Optional[str]):
        self._phone_number = value

    @property
    def department(self) -> Optional[str]:
        return self._department

    @department.setter
    def department(self, value: Optional[str]):
        self._department = value

    @property
    def avatar(self) -> Optional[str]:
        return self._avatar

    @avatar.setter
    def avatar(self, value: Optional[str]):
        self._avatar = value

    @property
    def password_hash(self) -> Optional[str]:
        return self._password_hash

    @password_hash.setter
    def password_hash(self, value: Optional[str]):
        self._password_hash = value

    @property
    def approved_by(self) -> Optional[str]:
        return self._approved_by

    @approved_by.setter
    def approved_by(self, value: Optional[str]):
        self._approved_by = value

    @property
    def approved_at(self) -> Optional[datetime]:
        return self._approved_at

    @approved_at.setter
    def approved_at(self, value: Optional[datetime]):
        self._approved_at = value

    # ==========================================================
    # BUSINESS METHODS
    # ==========================================================

    def approve(self, approver_id: str):
        self.status = "APPROVED"
        self._approved_by = approver_id
        self._approved_at = datetime.now()

    def lock(self):
        self.status = "LOCKED"

    def is_approved(self) -> bool:
        return self.status == "APPROVED"

    def is_locked(self) -> bool:
        return self.status == "LOCKED"

    # ==========================================================
    # TO DICT
    # ==========================================================

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "status": self.status,
            "phone_number": self.phone_number,
            "department": self.department,
            "avatar": self.avatar,
            "approved_by": self.approved_by,
            "approved_at": self.approved_at,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }