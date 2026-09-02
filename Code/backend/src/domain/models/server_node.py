from datetime import datetime
from typing import Dict, Any, Optional, List
from .base_entity import BaseEntity


class ServerNode(BaseEntity):
    """
    Domain Entity đại diện cho máy chủ vật lý trong tủ rack Data Center.
    Hỗ trợ ánh xạ định danh QR AR để kỹ thuật viên quét thiết bị tại hiện trường.
    """

    VALID_STATUSES = {"HEALTHY", "WARNING", "CRITICAL", "OFFLINE"}

    def __init__(
        self,
        id: str,
        rack_id: str,
        name: str,
        u_start: int,
        u_height: int = 2,
        ip_address: str = "127.0.0.1",
        mac_address: Optional[str] = None,
        model: Optional[str] = "Generic Server",
        cpu_model: Optional[str] = "Multi-Core CPU",
        ram_total_gb: int = 32,
        disk_total_gb: int = 1000,
        qr_code_payload: Optional[str] = None,
        status: str = "HEALTHY",
        metrics: Optional[Dict[str, float]] = None,
        containers: Optional[List[Dict[str, Any]]] = None,
        last_heartbeat_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        super().__init__(id=id, created_at=created_at, updated_at=updated_at)
        self._rack_id = rack_id
        self._name = name
        self.u_start = u_start
        self.u_height = u_height
        self.ip_address = ip_address
        self._mac_address = mac_address
        self._model = model
        self._cpu_model = cpu_model
        self.ram_total_gb = ram_total_gb
        self.disk_total_gb = disk_total_gb
        self._qr_code_payload = qr_code_payload or f"ar-imms://node/{id}"
        self.status = status
        self._metrics = metrics or {"cpu": 0.0, "ram": 0.0, "disk": 0.0, "temp": 0.0, "netIn": 0.0, "netOut": 0.0}
        self._containers = containers or []
        self._last_heartbeat_at = last_heartbeat_at or datetime.utcnow()

    # --- Encapsulation & Validation via Getters & Setters ---

    @property
    def rack_id(self) -> str:
        return self._rack_id

    @rack_id.setter
    def rack_id(self, value: str):
        if not value or not str(value).strip():
            raise ValueError("Mã tủ rack (rack_id) không được để trống")
        self._rack_id = str(value).strip()
        self.touch()

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, value: str):
        if not value or len(str(value).strip()) < 2:
            raise ValueError("Tên Node phải có ít nhất 2 ký tự")
        self._name = str(value).strip()
        self.touch()

    @property
    def u_start(self) -> int:
        return self._u_start

    @u_start.setter
    def u_start(self, value: int):
        val = int(value)
        if not (1 <= val <= 48):
            raise ValueError("Vị trí U slot bắt đầu phải nằm trong khoảng 1 - 48")
        self._u_start = val
        self.touch()

    @property
    def u_height(self) -> int:
        return self._u_height

    @u_height.setter
    def u_height(self, value: int):
        val = int(value)
        if not (1 <= val <= 10):
            raise ValueError("Chiều cao U-height phải từ 1U đến 10U")
        self._u_height = val
        self.touch()

    @property
    def ip_address(self) -> str:
        return self._ip_address

    @ip_address.setter
    def ip_address(self, value: str):
        if not value or not str(value).strip():
            raise ValueError("Địa chỉ IP không được để trống")
        self._ip_address = str(value).strip()
        self.touch()

    @property
    def ram_total_gb(self) -> int:
        return self._ram_total_gb

    @ram_total_gb.setter
    def ram_total_gb(self, value: int):
        val = int(value)
        if val <= 0:
            raise ValueError("Dung lượng RAM phải lớn hơn 0 GB")
        self._ram_total_gb = val
        self.touch()

    @property
    def disk_total_gb(self) -> int:
        return self._disk_total_gb

    @disk_total_gb.setter
    def disk_total_gb(self, value: int):
        val = int(value)
        if val <= 0:
            raise ValueError("Dung lượng Disk phải lớn hơn 0 GB")
        self._disk_total_gb = val
        self.touch()

    @property
    def qr_code_payload(self) -> str:
        return self._qr_code_payload

    @qr_code_payload.setter
    def qr_code_payload(self, value: str):
        if not value:
            raise ValueError("QR code payload không được rỗng")
        self._qr_code_payload = str(value).strip()
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

    @property
    def metrics(self) -> Dict[str, float]:
        return self._metrics

    @property
    def containers(self) -> List[Dict[str, Any]]:
        return self._containers

    # --- Domain Business Methods ---

    def update_telemetry(self, cpu: float, ram: float, disk: float, temp: float, net_in: float = 0.0, net_out: float = 0.0):
        """Cập nhật chỉ số đo lường thời gian thực và tự động đánh giá trạng thái."""
        self._metrics = {
            "cpu": round(float(cpu), 1),
            "ram": round(float(ram), 1),
            "disk": round(float(disk), 1),
            "temp": round(float(temp), 1),
            "netIn": round(float(net_in), 1),
            "netOut": round(float(net_out), 1),
        }
        self._last_heartbeat_at = datetime.utcnow()

        # Tự động suy luận trạng thái sức khỏe
        if cpu >= 90.0 or temp >= 75.0 or ram >= 95.0:
            self._status = "CRITICAL"
        elif cpu >= 75.0 or temp >= 65.0 or ram >= 80.0:
            self._status = "WARNING"
        else:
            self._status = "HEALTHY"
        self.touch()

    def set_containers(self, containers_list: List[Dict[str, Any]]):
        """Cập nhật danh sách workloads / docker containers chạy trên node."""
        self._containers = containers_list or []
        self.touch()

    def mark_offline(self):
        """Chuyển node sang trạng thái ngoại tuyến."""
        self._status = "OFFLINE"
        self.touch()

    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "rack_id": self._rack_id,
            "name": self._name,
            "u_start": self._u_start,
            "u_height": self._u_height,
            "slot": f"U{self._u_start} - U{self._u_start + self._u_height - 1} ({self._u_height}U)",
            "ip_address": self._ip_address,
            "mac_address": self._mac_address,
            "model": self._model,
            "cpu_model": self._cpu_model,
            "ram_total_gb": self._ram_total_gb,
            "disk_total_gb": self._disk_total_gb,
            "qr_code_payload": self._qr_code_payload,
            "status": self._status,
            "metrics": self._metrics,
            "containers": self._containers,
            "last_heartbeat_at": self._last_heartbeat_at.isoformat() if self._last_heartbeat_at else None,
        })
        return data
