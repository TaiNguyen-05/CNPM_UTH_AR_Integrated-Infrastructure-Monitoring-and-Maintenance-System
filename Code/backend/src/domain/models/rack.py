from datetime import datetime
from typing import Dict, Any, Optional
from .base_entity import BaseEntity


class Rack(BaseEntity):
    """
    Domain Entity đại diện cho Tủ Rack trong phòng máy chủ Data Center.
    """

    def __init__(
        self,
        id: str,
        name: str,
        code: str,
        room_name: str = "Server Room 01",
        total_u: int = 42,
        power_limit_kw: float = 10.0,
        x_coord: float = 0.0,
        y_coord: float = 0.0,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        super().__init__(id=id, created_at=created_at, updated_at=updated_at)
        self.name = name
        self.code = code
        self._room_name = room_name
        self.total_u = total_u
        self.power_limit_kw = power_limit_kw
        self._x_coord = x_coord
        self._y_coord = y_coord

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, value: str):
        if not value or not str(value).strip():
            raise ValueError("Tên tủ rack không được để trống")
        self._name = str(value).strip()
        self.touch()

    @property
    def code(self) -> str:
        return self._code

    @code.setter
    def code(self, value: str):
        if not value or not str(value).strip():
            raise ValueError("Mã định danh tủ rack (code) không được để trống")
        self._code = str(value).strip().upper()
        self.touch()

    @property
    def total_u(self) -> int:
        return self._total_u

    @total_u.setter
    def total_u(self, value: int):
        val = int(value)
        if not (12 <= val <= 60):
            raise ValueError("Tổng số U của tủ rack phải trong khoảng từ 12U đến 60U")
        self._total_u = val
        self.touch()

    @property
    def power_limit_kw(self) -> float:
        return self._power_limit_kw

    @power_limit_kw.setter
    def power_limit_kw(self, value: float):
        val = float(value)
        if val <= 0:
            raise ValueError("Giới hạn công suất rack (kW) phải lớn hơn 0")
        self._power_limit_kw = val
        self.touch()

    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            "name": self._name,
            "code": self._code,
            "room_name": self._room_name,
            "total_u": self._total_u,
            "power_limit_kw": self._power_limit_kw,
            "x_coord": self._x_coord,
            "y_coord": self._y_coord,
        })
        return data
