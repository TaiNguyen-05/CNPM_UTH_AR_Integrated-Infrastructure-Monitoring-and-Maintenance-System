from abc import ABC
from typing import Generic, TypeVar, List, Optional, Dict, Any, Type

from domain.models.base_entity import BaseEntity
from domain.models.interfaces import IBaseRepository
from infrastructure.databases.db_session import db_session


TDomain = TypeVar("TDomain", bound=BaseEntity)
TModel = TypeVar("TModel")


class BaseRepository(
    Generic[TDomain, TModel],
    IBaseRepository[TDomain],
    ABC
):
    """
    Base Repository dùng chung cho các Repository.

    Chức năng:
    - Add
    - Get by ID
    - List
    - Update
    - Delete

    Có xử lý rollback và đóng session
    để tránh lỗi PostgreSQL:
    current transaction is aborted.
    """

    def __init__(self, model_class: Type[TModel]):
        self.model_class = model_class

    # ========================================================
    # SESSION
    # ========================================================

    def _get_session(self):
        return db_session()

    # ========================================================
    # CONVERSION
    # ========================================================

    def _to_domain(self, model: TModel) -> TDomain:
        raise NotImplementedError

    def _to_model(self, entity: TDomain) -> TModel:
        raise NotImplementedError

    # ========================================================
    # CREATE
    # ========================================================

    def add(self, entity: TDomain) -> TDomain:

        session = self._get_session()

        try:
            model = self._to_model(entity)

            session.add(model)
            session.commit()
            session.refresh(model)

            return self._to_domain(model)

        except Exception:
            session.rollback()
            raise

        finally:
            session.close()

    # ========================================================
    # GET BY ID
    # ========================================================

    def get_by_id(
        self,
        entity_id: str
    ) -> Optional[TDomain]:

        session = self._get_session()

        try:
            model = (
                session.query(self.model_class)
                .filter_by(id=entity_id)
                .first()
            )

            return (
                self._to_domain(model)
                if model
                else None
            )

        except Exception:
            session.rollback()
            raise

        finally:
            session.close()

    # ========================================================
    # LIST
    # ========================================================

    def list(
        self,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[TDomain]:

        session = self._get_session()

        try:

            query = session.query(self.model_class)

            if filters:

                for key, value in filters.items():

                    if (
                        hasattr(self.model_class, key)
                        and value is not None
                    ):
                        query = query.filter(
                            getattr(self.model_class, key) == value
                        )

            models = query.all()

            return [
                self._to_domain(model)
                for model in models
            ]

        except Exception:
            session.rollback()
            raise

        finally:
            session.close()

    # ========================================================
    # UPDATE
    # ========================================================

    def update(
        self,
        entity: TDomain
    ) -> TDomain:

        session = self._get_session()

        try:

            model = (
                session.query(self.model_class)
                .filter_by(id=entity.id)
                .first()
            )

            if not model:
                raise ValueError(
                    f"Không tìm thấy bản ghi với ID: {entity.id}"
                )

            new_model = self._to_model(entity)

            for column in self.model_class.__table__.columns:

                column_name = column.name

                if column_name == "id":
                    continue

                value = getattr(
                    new_model,
                    column_name,
                    None
                )

                if value is not None:
                    setattr(
                        model,
                        column_name,
                        value
                    )

            session.commit()
            session.refresh(model)

            return self._to_domain(model)

        except Exception:
            session.rollback()
            raise

        finally:
            session.close()

    # ========================================================
    # DELETE
    # ========================================================

    def delete(
        self,
        entity_id: str
    ) -> bool:

        session = self._get_session()

        try:

            model = (
                session.query(self.model_class)
                .filter_by(id=entity_id)
                .first()
            )

            if not model:
                return False

            session.delete(model)
            session.commit()

            return True

        except Exception:
            session.rollback()
            raise

        finally:
            session.close()