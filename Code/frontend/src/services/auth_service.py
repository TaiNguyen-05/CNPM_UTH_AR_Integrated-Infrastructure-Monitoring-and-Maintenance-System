import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from dotenv import load_dotenv

from infrastructure.repositories.user_repository import UserRepository


load_dotenv()


class AuthService:

    def __init__(self):
        self.user_repository = UserRepository()

        self.secret_key = os.environ.get("JWT_SECRET_KEY")

        if not self.secret_key:
            raise RuntimeError(
                "JWT_SECRET_KEY chưa được cấu hình trong file .env"
            )

        expires_minutes = int(
            os.environ.get(
                "JWT_ACCESS_TOKEN_EXPIRES_MINUTES",
                "60"
            )
        )

        self.expires_minutes = expires_minutes

    # ==========================================================
    # VERIFY PASSWORD
    # ==========================================================

    def verify_password(
        self,
        password: str,
        password_hash: str
    ) -> bool:

        if not password_hash:
            return False

        return bcrypt.checkpw(
            password.encode("utf-8"),
            password_hash.encode("utf-8")
        )

    # ==========================================================
    # LOGIN
    # ==========================================================

    def login(self, email: str, password: str):

        user = self.user_repository.get_by_email(email)

        if not user:
            raise ValueError("Email hoặc mật khẩu không đúng.")

        if not self.verify_password(
            password,
            user.password_hash
        ):
            raise ValueError("Email hoặc mật khẩu không đúng.")

        if user.status != "APPROVED":
            raise ValueError(
                f"Tài khoản chưa được phép đăng nhập. "
                f"Status: {user.status}"
            )

        access_token = self.create_access_token(user)

        return {
            "access_token": access_token,
            "token_type": "Bearer",
            "expires_in": self.expires_minutes * 60,
            "user": user.to_dict(),
        }

    # ==========================================================
    # CREATE JWT ACCESS TOKEN
    # ==========================================================

    def create_access_token(self, user):

        now = datetime.now(timezone.utc)

        expires_at = now + timedelta(
            minutes=self.expires_minutes
        )

        payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "status": user.status,
            "iat": now,
            "exp": expires_at,
        }

        token = jwt.encode(
            payload,
            self.secret_key,
            algorithm="HS256"
        )

        return token

    # ==========================================================
    # DECODE JWT
    # ==========================================================

    def decode_access_token(self, token: str):

        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=["HS256"]
            )

            return payload

        except jwt.ExpiredSignatureError:
            raise ValueError("JWT đã hết hạn.")

        except jwt.InvalidTokenError:
            raise ValueError("JWT không hợp lệ.")