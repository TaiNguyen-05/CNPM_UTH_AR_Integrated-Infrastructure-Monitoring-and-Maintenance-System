from abc import ABC
from typing import Generic, TypeVar, List, Optional, Dict, Any, Type
from domain.models.base_entity import BaseEntity
from domain.models.interfaces import IBaseRepository
from infrastructure.databases.db_session import db_session

TDomain = TypeVar("TDomain", bound=BaseEntity)
TModel = TypeVar("TModel")


class BaseRepository(Generic[TDomain, TModel], IBaseRepository[TDomain], ABC):
    """
    Lớp trừu tượng cài đặt BaseRepository chung, áp dụng tính kế thừa và đa hình (Inheritance & Polymorphism).
    Tự động xử lý ORM Session và ánh xạ 2 chiều giữa ORM Model và Domain Entity.
    """

    def __init__(self, model_class: Type[TModel]):
        self.model_class = model_class

    def _get_session(self):
        return db_session()

    def _to_domain(self, model: TModel) -> TDomain:
        """Phương thức trừu tượng chuyển đổi từ ORM Model sang Domain Entity."""
        raise NotImplementedError

    def _to_model(self, entity: TDomain) -> TModel:
        """Phương thức trừu tượng chuyển đổi từ Domain Entity sang ORM Model."""
        raise NotImplementedError

    def add(self, entity: TDomain) -> TDomain:
        session = self._get_session()
        try:
            model = self._to_model(entity)
            session.add(model)
            session.commit()
            session.refresh(model)
            return self._to_domain(model)
        except Exception as e:
            session.rollback()
            raise e

    def get_by_id(self, entity_id: str) -> Optional[TDomain]:
        session = self._get_session()
        model = session.query(self.model_class).filter_by(id=entity_id).first()
        return self._to_domain(model) if model else None

    def list(self, filters: Optional[Dict[str, Any]] = None) -> List[TDomain]:
        session = self._get_session()
        query = session.query(self.model_class)
        if filters:
            for key, val in filters.items():
                if hasattr(self.model_class, key) and val is not None:
                    query = query.filter(getattr(self.model_class, key) == val)
        models = query.all()
        return [self._to_domain(m) for m in models]

    def update(self, entity: TDomain) -> TDomain:
        session = self._get_session()
        try:
            model = session.query(self.model_class).filter_by(id=entity.id).first()
            if not model:
                raise ValueError(f"Không tìm thấy bản ghi với ID: {entity.id}")
            
            # Cập nhật các trường
            new_model = self._to_model(entity)
            for column in self.model_class.__table__.columns:
                col_name = column.name
                if col_name != 'id':
                    setattr(model, col_name, getattr(new_model, col_name))
            
            session.commit()
            session.refresh(model)
            return self._to_domain(model)
        except Exception as e:
            session.rollback()
            raise e

    def delete(self, entity_id: str) -> bool:
        session = self._get_session()
        try:
            model = session.query(self.model_class).filter_by(id=entity_id).first()
            if not model:
                return False
            session.delete(model)
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            raise e
