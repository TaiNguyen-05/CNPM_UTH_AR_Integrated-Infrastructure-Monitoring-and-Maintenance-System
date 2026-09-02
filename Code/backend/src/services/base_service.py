from typing import Generic, TypeVar, List, Optional, Dict, Any
from domain.models.base_entity import BaseEntity
from domain.models.interfaces import IBaseRepository

T = TypeVar("T", bound=BaseEntity)


class BaseService(Generic[T]):
    """
    Lớp cơ sở xử lý logic nghiệp vụ CRUD chung cho các Domain Service.
    Áp dụng tính kế thừa và Dependency Injection.
    """

    def __init__(self, repository: IBaseRepository[T]):
        self.repository = repository

    def create(self, entity: T) -> T:
        """Tạo mới thực thể và áp dụng validation nghiệp vụ."""
        return self.repository.add(entity)

    def get_by_id(self, entity_id: str) -> Optional[T]:
        """Lấy thực thể theo ID."""
        return self.repository.get_by_id(entity_id)

    def list_all(self, filters: Optional[Dict[str, Any]] = None) -> List[T]:
        """Lấy danh sách tất cả các thực thể."""
        return self.repository.list(filters)

    def update(self, entity: T) -> T:
        """Cập nhật thực thể."""
        return self.repository.update(entity)

    def delete(self, entity_id: str) -> bool:
        """Xóa thực thể theo ID."""
        return self.repository.delete(entity_id)
