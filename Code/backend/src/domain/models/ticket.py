from datetime import datetime
from typing import Dict, Any, Optional, List
from .base_entity import BaseEntity


class MaintenanceTicket(BaseEntity):
    """
    Domain Entity đại diện cho Phiếu yêu cầu Bảo trì / Sửa chữa Data Center (Ticket).
    Gán cho Kỹ thuật viên xử lý trực tiếp tại hiện trường thông qua ứng dụng AR.
    """

    VALID_PRIORITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
    VALID_STATUSES = {"CREATED", "ASSIGNED", "IN_PROGRESS", "PENDING_PARTS", "RESOLVED", "CLOSED"}

    def __init__(
        self,
        id: str,
        server_node_id: str,
        title: str,
        description: str = "",
        priority: str = "MEDIUM",
        status: str = "CREATED",
        alert_id: Optional[str] = None,
        assigned_technician_id: Optional[str] = None,
        assigned_technician_name: Optional[str] = None,
        created_by: Optional[str] = None,
        resolution_notes: Optional[str] = None,
        ar_session_logs: Optional[List[Dict[str, Any]]] = None,
        created_at: Optional[datetime] = None,
        started_at: Optional[datetime] = None,
        resolved_at: Optional[datetime] = None,
        closed_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        super().__init__(id=id, created_at=created_at, updated_at=updated_at)
        self.server_node_id = server_node_id
        self.title = title
        self._description = description
        self.priority = priority
        self.status = status
        self._alert_id = alert_id
        self._assigned_technician_id = assigned_technician_id
        self._assigned_technician_name = assigned_technician_name
        self._created_by = created_by
        self._resolution_notes = resolution_notes
        self._ar_session_logs = ar_session_logs or []
        self._started_at = started_at
        self._resolved_at = resolved_at
        self._closed_at = closed_at

    @property
    def server_node_id(self) -> str:
        return self._server_node_id

    @server_node_id.setter
    def server_node_id(self, value: str):
        if not value or not str(value).strip():
            raise ValueError("Mã Node của ticket không được để trống")
        self._server_node_id = str(value).strip()
        self.touch()

    @property
    def title(self) -> str:
        return self._title

    @title.setter
    def title(self, value: str):
        if not value or len(str(value).strip()) < 3:
            raise ValueError("Tiêu đề phiếu bảo trì phải có ít nhất 3 ký tự")
        self._title = str(value).strip()
        self.touch()

    @property
    def priority(self) -> str:
        return self._priority

    @priority.setter
    def priority(self, value: str):
        val = str(value).upper().strip()
        if val not in self.VALID_PRIORITIES:
            raise ValueError(f"Mức ưu tiên {value} không hợp lệ. Cho phép: {self.VALID_PRIORITIES}")
        self._priority = val
        self.touch()

    @property
    def status(self) -> str:
        return self._status

    @status.setter
    def status(self, value: str):
        val = str(value).upper().strip()
        if val not in self.VALID_STATUSES:
            raise ValueError(f"Trạng thái ticket {value} không hợp lệ. Cho phép: {self.VALID_STATUSES}")
        self._status = val
        self.touch()

    # --- Domain Business Methods ---

    def assign_to(self, technician_id: str, technician_name: Optional[str] = None):
        """Phân công phiếu cho Kỹ thuật viên hiện trường."""
        if not technician_id:
            raise ValueError("Mã kỹ thuật viên không được để trống")
        self._assigned_technician_id = technician_id
        if technician_name:
            self._assigned_technician_name = technician_name
        self._status = "ASSIGNED"
        self.touch()

    def start_work(self):
        """Bắt đầu tiến hành bảo trì tại rack/node."""
        self._status = "IN_PROGRESS"
        self._started_at = datetime.utcnow()
        self.touch()

    def add_ar_log(self, action: str, details: Dict[str, Any]):
        """Ghi nhận log phiên tương tác AR tại thiết bị."""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "action": action,
            "details": details,
        }
        self._ar_session_logs.append(log_entry)
        self.touch()

    def resolve(self, notes: str):
        """Hoàn tất sửa chữa với ghi chú khắc phục."""
        self._status = "RESOLVED"
        self._resolution_notes = notes
        self._resolved_at = datetime.utcnow()
        self.touch()

    def close(self):
        """Đóng phiếu sau khi Operator phê duyệt nghiệm thu."""
        self._status = "CLOSED"
        self._closed_at = datetime.utcnow()
        self.touch()

    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "server_node_id": self._server_node_id,
            "alert_id": self._alert_id,
            "title": self._title,
            "description": self._description,
            "priority": self._priority,
            "status": self._status,
            "assigned_technician_id": self._assigned_technician_id,
            "assigned_technician_name": self._assigned_technician_name,
            "created_by": self._created_by,
            "resolution_notes": self._resolution_notes,
            "ar_session_logs": self._ar_session_logs,
            "started_at": self._started_at.isoformat() if self._started_at else None,
            "resolved_at": self._resolved_at.isoformat() if self._resolved_at else None,
            "closed_at": self._closed_at.isoformat() if self._closed_at else None,
        })
        return data
