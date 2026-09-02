from datetime import datetime
from typing import Dict, Any, Optional
from .base_entity import BaseEntity


class Alert(BaseEntity):
    """
    Domain Entity đại diện cho Cảnh báo sự cố (Alert / Incident) trên máy chủ.
    """

    VALID_SEVERITIES = {"INFO", "WARNING", "CRITICAL"}
    VALID_STATUSES = {"OPEN", "ACKNOWLEDGED", "RESOLVED", "DISMISSED"}

    def __init__(
        self,
        id: str,
        server_node_id: str,
        title: str,
        message: str,
        severity: str = "WARNING",
        metric_name: Optional[str] = "cpu",
        metric_value: Optional[float] = 0.0,
        threshold_value: Optional[float] = 80.0,
        status: str = "OPEN",
        acknowledged_by: Optional[str] = None,
        acknowledged_at: Optional[datetime] = None,
        resolved_by: Optional[str] = None,
        resolved_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        super().__init__(id=id, created_at=created_at, updated_at=updated_at)
        self.server_node_id = server_node_id
        self.title = title
        self.message = message
        self.severity = severity
        self._metric_name = metric_name
        self._metric_value = float(metric_value) if metric_value is not None else 0.0
        self._threshold_value = float(threshold_value) if threshold_value is not None else 80.0
        self.status = status
        self._acknowledged_by = acknowledged_by
        self._acknowledged_at = acknowledged_at
        self._resolved_by = resolved_by
        self._resolved_at = resolved_at

    @property
    def server_node_id(self) -> str:
        return self._server_node_id

    @server_node_id.setter
    def server_node_id(self, value: str):
        if not value or not str(value).strip():
            raise ValueError("Mã Node bị cảnh báo không được để trống")
        self._server_node_id = str(value).strip()
        self.touch()

    @property
    def title(self) -> str:
        return self._title

    @title.setter
    def title(self, value: str):
        if not value or not str(value).strip():
            raise ValueError("Tiêu đề cảnh báo không được để trống")
        self._title = str(value).strip()
        self.touch()

    @property
    def message(self) -> str:
        return self._message

    @message.setter
    def message(self, value: str):
        self._message = str(value).strip() if value else ""
        self.touch()

    @property
    def severity(self) -> str:
        return self._severity

    @severity.setter
    def severity(self, value: str):
        val = str(value).upper().strip()
        if val not in self.VALID_SEVERITIES:
            raise ValueError(f"Mức độ cảnh báo {value} không hợp lệ. Cho phép: {self.VALID_SEVERITIES}")
        self._severity = val
        self.touch()

    @property
    def status(self) -> str:
        return self._status

    @status.setter
    def status(self, value: str):
        val = str(value).upper().strip()
        if val not in self.VALID_STATUSES:
            raise ValueError(f"Trạng thái cảnh báo {value} không hợp lệ. Cho phép: {self.VALID_STATUSES}")
        self._status = val
        self.touch()

    # --- Domain Business Methods ---

    def acknowledge(self, user_id: str):
        """Xác nhận đã tiếp nhận cảnh báo."""
        if self._status in {"RESOLVED", "DISMISSED"}:
            raise ValueError(f"Không thể xác nhận cảnh báo đã ở trạng thái {self._status}")
        self._status = "ACKNOWLEDGED"
        self._acknowledged_by = user_id
        self._acknowledged_at = datetime.utcnow()
        self.touch()

    def resolve(self, user_id: str):
        """Đánh dấu cảnh báo đã được khắc phục xong."""
        self._status = "RESOLVED"
        self._resolved_by = user_id
        self._resolved_at = datetime.utcnow()
        self.touch()

    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "server_node_id": self._server_node_id,
            "title": self._title,
            "message": self._message,
            "severity": self._severity,
            "metric_name": self._metric_name,
            "metric_value": self._metric_value,
            "threshold_value": self._threshold_value,
            "status": self._status,
            "acknowledged_by": self._acknowledged_by,
            "acknowledged_at": self._acknowledged_at.isoformat() if self._acknowledged_at else None,
            "resolved_by": self._resolved_by,
            "resolved_at": self._resolved_at.isoformat() if self._resolved_at else None,
        })
        return data
