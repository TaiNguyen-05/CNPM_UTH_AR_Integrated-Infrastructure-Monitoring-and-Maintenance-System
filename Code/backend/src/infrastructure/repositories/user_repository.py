from typing import Optional, List
from uuid import UUID

from domain.models.user import UserAccount
from domain.models.interfaces import IUserRepository

from infrastructure.repositories.base_repository import BaseRepository
from infrastructure.models.ar_models import UserModel


class UserRepository(
    BaseRepository[UserAccount, UserModel],
    IUserRepository
):
    def __init__(self):
        super().__init__(UserModel)

    # ==========================================================
    # MODEL -> DOMAIN
    # ==========================================================
    def _to_domain(self, model: UserModel) -> Optional[UserAccount]:
        if not model:
            return None

        return UserAccount(
            id=str(model.id),
            email=model.email,
            full_name=model.full_name,
            role=model.role,
            status=model.status,
            phone_number=model.phone_number,
            department=model.department,
            avatar=model.avatar_url,
            password_hash=model.password_hash,
            approved_by=str(model.approved_by)
            if model.approved_by else None,
            approved_at=model.approved_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    # ==========================================================
    # DOMAIN -> MODEL
    # ==========================================================
    def _to_model(self, entity: UserAccount) -> UserModel:
        return UserModel(
            id=UUID(entity.id) if isinstance(entity.id, str) else entity.id,
            email=entity.email,
            password_hash=entity.password_hash,
            full_name=entity.full_name,
            role=entity.role,
            status=entity.status,
            avatar_url=entity.avatar,
            phone_number=entity.phone_number,
            department=entity.department,
            approved_by=(
                UUID(entity.approved_by)
                if entity.approved_by
                and isinstance(entity.approved_by, str)
                else entity.approved_by
            ),
            approved_at=entity.approved_at,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
            last_login_at=None,
        )

    # ==========================================================
    # FIND USER BY EMAIL
    # ==========================================================
    def get_by_email(self, email: str) -> Optional[UserAccount]:
        session = self._get_session()

        try:
            model = (
                session.query(UserModel)
                .filter(UserModel.email == email.strip().lower())
                .first()
            )

            return self._to_domain(model) if model else None

        except Exception:
            session.rollback()
            raise

        finally:
            session.close()

    # ==========================================================
    # LIST PENDING USERS
    # ==========================================================
    def list_pending(self) -> List[UserAccount]:
        session = self._get_session()

        try:
            models = (
                session.query(UserModel)
                .filter(
                    UserModel.status == "PENDING_APPROVAL"
                )
                .all()
            )

            return [
                self._to_domain(model)
                for model in models
            ]

        except Exception:
            session.rollback()
            raise

        finally:
            session.close()