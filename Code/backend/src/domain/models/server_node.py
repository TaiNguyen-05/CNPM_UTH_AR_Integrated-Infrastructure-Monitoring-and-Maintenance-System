from typing import List, Optional
from datetime import datetime

from domain.models.base_entity import BaseEntity


class ServerNode(BaseEntity):
    """
    Domain Entity đại diện cho một Server Node.

    ServerNode chứa thông tin phần cứng, vị trí rack,
    trạng thái hoạt động và thông tin telemetry.
    """

    VALID_STATUSES = {
        "HEALTHY",
        "WARNING",
        "CRITICAL",
        "OFFLINE",
    }

    def __init__(
        self,
        id: str,
        rack_id: str,
        name: str,
        u_start: int,
        u_height: int,
        ip_address: str,
        mac_address: Optional[str] = None,
        model: Optional[str] = None,
        cpu_model: Optional[str] = None,
        ram_total_gb: Optional[int] = None,
        disk_total_gb: Optional[int] = None,
        qr_code_payload: Optional[str] = None,
        status: str = "HEALTHY",
        metrics: Optional[dict] = None,
        containers: Optional[list] = None,
        last_heartbeat_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        super().__init__(
            id=id,
            created_at=created_at,
            updated_at=updated_at,
        )

        self._rack_id = rack_id
        self._name = name
        self._u_start = u_start
        self._u_height = u_height
        self._ip_address = ip_address
        self._mac_address = mac_address
        self._model = model
        self._cpu_model = cpu_model
        self._ram_total_gb = ram_total_gb
        self._disk_total_gb = disk_total_gb
        self._qr_code_payload = qr_code_payload
        self._status = status
        self._metrics = metrics if metrics is not None else {}
        self._containers = containers if containers is not None else []
        self._last_heartbeat_at = last_heartbeat_at

        self._validate_status()

    # ========================================================
    # PROPERTIES
    # ========================================================

    @property
    def rack_id(self) -> str:
        return self._rack_id

    @rack_id.setter
    def rack_id(self, value: str):
        if not value:
            raise ValueError("rack_id không được để trống")
        self._rack_id = value

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, value: str):
        if not value or not value.strip():
            raise ValueError("Tên Server Node không được để trống")
        self._name = value.strip()

    @property
    def u_start(self) -> int:
        return self._u_start

    @u_start.setter
    def u_start(self, value: int):
        if value < 1:
            raise ValueError("u_start phải lớn hơn hoặc bằng 1")
        self._u_start = value

    @property
    def u_height(self) -> int:
        return self._u_height

    @u_height.setter
    def u_height(self, value: int):
        if value < 1:
            raise ValueError("u_height phải lớn hơn hoặc bằng 1")
        self._u_height = value

    @property
    def ip_address(self) -> str:
        return self._ip_address

    @ip_address.setter
    def ip_address(self, value: str):
        if not value or not value.strip():
            raise ValueError("IP address không được để trống")
        self._ip_address = value.strip()

    @property
    def mac_address(self) -> Optional[str]:
        return self._mac_address

    @mac_address.setter
    def mac_address(self, value: Optional[str]):
        self._mac_address = value

    @property
    def model(self) -> Optional[str]:
        return self._model

    @model.setter
    def model(self, value: Optional[str]):
        self._model = value

    @property
    def cpu_model(self) -> Optional[str]:
        return self._cpu_model

    @cpu_model.setter
    def cpu_model(self, value: Optional[str]):
        self._cpu_model = value

    @property
    def ram_total_gb(self) -> Optional[int]:
        return self._ram_total_gb

    @ram_total_gb.setter
    def ram_total_gb(self, value: Optional[int]):
        self._ram_total_gb = value

    @property
    def disk_total_gb(self) -> Optional[int]:
        return self._disk_total_gb

    @disk_total_gb.setter
    def disk_total_gb(self, value: Optional[int]):
        self._disk_total_gb = value

    @property
    def qr_code_payload(self) -> Optional[str]:
        return self._qr_code_payload

    @qr_code_payload.setter
    def qr_code_payload(self, value: Optional[str]):
        self._qr_code_payload = value

    @property
    def status(self) -> str:
        return self._status

    @status.setter
    def status(self, value: str):
        value = value.upper()

        if value not in self.VALID_STATUSES:
            raise ValueError(
                f"Status không hợp lệ: {value}. "
                f"Cho phép: {self.VALID_STATUSES}"
            )

        self._status = value

    @property
    def metrics(self) -> dict:
        return self._metrics

    @metrics.setter
    def metrics(self, value: Optional[dict]):
        self._metrics = value if value is not None else {}

    @property
    def containers(self) -> list:
        return self._containers

    @containers.setter
    def containers(self, value: Optional[list]):
        self._containers = value if value is not None else []

    @property
    def last_heartbeat_at(self) -> Optional[datetime]:
        return self._last_heartbeat_at

    @last_heartbeat_at.setter
    def last_heartbeat_at(self, value: Optional[datetime]):
        self._last_heartbeat_at = value

    # ========================================================
    # VALIDATION
    # ========================================================

    def _validate_status(self):
        if self._status not in self.VALID_STATUSES:
            raise ValueError(
                f"Status không hợp lệ: {self._status}"
            )

    # ========================================================
    # TELEMETRY
    # ========================================================

    def update_metrics(self, metrics: dict):
        """
        Cập nhật thông tin telemetry.
        """

        if not isinstance(metrics, dict):
            raise ValueError("metrics phải là dictionary")

        self._metrics = metrics

    def update_containers(self, containers: list):
        """
        Cập nhật danh sách container.
        """

        if not isinstance(containers, list):
            raise ValueError("containers phải là list")

        self._containers = containers

    def update_heartbeat(
        self,
        heartbeat_at: Optional[datetime] = None
    ):
        """
        Cập nhật thời gian heartbeat cuối cùng.
        """

        self._last_heartbeat_at = (
            heartbeat_at
            if heartbeat_at is not None
            else datetime.now()
        )

    # ========================================================
    # STATUS
    # ========================================================

    def mark_healthy(self):
        self._status = "HEALTHY"

    def mark_warning(self):
        self._status = "WARNING"

    def mark_critical(self):
        self._status = "CRITICAL"

    def mark_offline(self):
        self._status = "OFFLINE"

    # ========================================================
    # SERIALIZATION
    # ========================================================

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "rack_id": self.rack_id,
            "name": self.name,
            "u_start": self.u_start,
            "u_height": self.u_height,
            "ip_address": self.ip_address,
            "mac_address": self.mac_address,
            "model": self.model,
            "cpu_model": self.cpu_model,
            "ram_total_gb": self.ram_total_gb,
            "disk_total_gb": self.disk_total_gb,
            "qr_code_payload": self.qr_code_payload,
            "status": self.status,
            "metrics": self.metrics,
            "containers": self.containers,
            "last_heartbeat_at": self.last_heartbeat_at,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }