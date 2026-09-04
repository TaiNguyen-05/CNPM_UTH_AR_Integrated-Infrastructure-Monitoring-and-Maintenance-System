from typing import Optional
from datetime import datetime

from domain.models.base_entity import BaseEntity


class Alert(BaseEntity):
    """
    Domain Entity đại diện cho một cảnh báo của Server Node.
    """

    VALID_SEVERITIES = {
        "INFO",
        "WARNING",
        "CRITICAL",
    }

    VALID_STATUSES = {
        "OPEN",
        "ACKNOWLEDGED",
        "RESOLVED",
        "DISMISSED",
    }

    def __init__(
        self,
        id: str,
        server_node_id: str,
        title: str,
        message: str,
        severity: str,
        metric_name: Optional[str] = None,
        metric_value: Optional[float] = None,
        threshold_value: Optional[float] = None,
        status: str = "OPEN",
        acknowledged_by: Optional[str] = None,
        acknowledged_at: Optional[datetime] = None,
        resolved_by: Optional[str] = None,
        resolved_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        super().__init__(
            id=id,
            created_at=created_at,
            updated_at=updated_at,
        )

        self._server_node_id = server_node_id
        self._title = title
        self._message = message
        self._severity = severity
        self._metric_name = metric_name
        self._metric_value = metric_value
        self._threshold_value = threshold_value
        self._status = status
        self._acknowledged_by = acknowledged_by
        self._acknowledged_at = acknowledged_at
        self._resolved_by = resolved_by
        self._resolved_at = resolved_at

        self._validate_severity()
        self._validate_status()

    # ========================================================
    # PROPERTIES
    # ========================================================

    @property
    def server_node_id(self) -> str:
        return self._server_node_id

    @server_node_id.setter
    def server_node_id(self, value: str):
        if not value:
            raise ValueError(
                "server_node_id không được để trống"
            )

        self._server_node_id = value

    @property
    def title(self) -> str:
        return self._title

    @title.setter
    def title(self, value: str):
        if not value or not value.strip():
            raise ValueError(
                "Tiêu đề cảnh báo không được để trống"
            )

        self._title = value.strip()

    @property
    def message(self) -> str:
        return self._message

    @message.setter
    def message(self, value: str):
        if not value or not value.strip():
            raise ValueError(
                "Nội dung cảnh báo không được để trống"
            )

        self._message = value.strip()

    @property
    def severity(self) -> str:
        return self._severity

    @severity.setter
    def severity(self, value: str):
        value = value.upper()

        if value not in self.VALID_SEVERITIES:
            raise ValueError(
                f"Severity không hợp lệ: {value}"
            )

        self._severity = value

    @property
    def metric_name(self) -> Optional[str]:
        return self._metric_name

    @metric_name.setter
    def metric_name(self, value: Optional[str]):
        self._metric_name = value

    @property
    def metric_value(self) -> Optional[float]:
        return self._metric_value

    @metric_value.setter
    def metric_value(self, value: Optional[float]):
        self._metric_value = value

    @property
    def threshold_value(self) -> Optional[float]:
        return self._threshold_value

    @threshold_value.setter
    def threshold_value(self, value: Optional[float]):
        self._threshold_value = value

    @property
    def status(self) -> str:
        return self._status

    @status.setter
    def status(self, value: str):
        value = value.upper()

        if value not in self.VALID_STATUSES:
            raise ValueError(
                f"Status không hợp lệ: {value}"
            )

        self._status = value

    @property
    def acknowledged_by(self) -> Optional[str]:
        return self._acknowledged_by

    @acknowledged_by.setter
    def acknowledged_by(self, value: Optional[str]):
        self._acknowledged_by = value

    @property
    def acknowledged_at(self) -> Optional[datetime]:
        return self._acknowledged_at

    @acknowledged_at.setter
    def acknowledged_at(
        self,
        value: Optional[datetime]
    ):
        self._acknowledged_at = value

    @property
    def resolved_by(self) -> Optional[str]:
        return self._resolved_by

    @resolved_by.setter
    def resolved_by(self, value: Optional[str]):
        self._resolved_by = value

    @property
    def resolved_at(self) -> Optional[datetime]:
        return self._resolved_at

    @resolved_at.setter
    def resolved_at(
        self,
        value: Optional[datetime]
    ):
        self._resolved_at = value

    # ========================================================
    # VALIDATION
    # ========================================================

    def _validate_severity(self):
        if self._severity not in self.VALID_SEVERITIES:
            raise ValueError(
                f"Severity không hợp lệ: {self._severity}"
            )

    def _validate_status(self):
        if self._status not in self.VALID_STATUSES:
            raise ValueError(
                f"Status không hợp lệ: {self._status}"
            )

    # ========================================================
    # BUSINESS METHODS
    # ========================================================

    def acknowledge(self, user_id: str):
        """
        Xác nhận cảnh báo.
        """

        if self._status not in {
            "OPEN",
            "ACKNOWLEDGED",
        }:
            raise ValueError(
                "Chỉ có cảnh báo OPEN hoặc ACKNOWLEDGED "
                "mới có thể xác nhận."
            )

        if not user_id:
            raise ValueError(
                "user_id không được để trống"
            )

        self._acknowledged_by = user_id
        self._acknowledged_at = datetime.now()
        self._status = "ACKNOWLEDGED"

    def resolve(self, user_id: str):
        """
        Giải quyết cảnh báo.
        """

        if self._status not in {
            "OPEN",
            "ACKNOWLEDGED",
        }:
            raise ValueError(
                "Cảnh báo hiện tại không thể resolve."
            )

        if not user_id:
            raise ValueError(
                "user_id không được để trống"
            )

        self._resolved_by = user_id
        self._resolved_at = datetime.now()
        self._status = "RESOLVED"

    def dismiss(self):
        """
        Bỏ qua cảnh báo.
        """

        if self._status in {
            "RESOLVED",
            "DISMISSED",
        }:
            raise ValueError(
                "Cảnh báo đã được xử lý."
            )

        self._status = "DISMISSED"

    # ========================================================
    # SERIALIZATION
    # ========================================================

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "server_node_id": self.server_node_id,
            "title": self.title,
            "message": self.message,
            "severity": self.severity,
            "metric_name": self.metric_name,
            "metric_value": self.metric_value,
            "threshold_value": self.threshold_value,
            "status": self.status,
            "acknowledged_by": self.acknowledged_by,
            "acknowledged_at": self.acknowledged_at,
            "resolved_by": self.resolved_by,
            "resolved_at": self.resolved_at,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }