import os
from pathlib import Path
from datetime import datetime, timedelta, timezone

try:
    import bcrypt
except ImportError:
    bcrypt = None

from werkzeug.security import check_password_hash
import jwt
from dotenv import load_dotenv

from infrastructure.repositories.user_repository import UserRepository


# Luôn đọc file .env nằm trong thư mục src
BASE_DIR = Path(__file__).resolve().parents[1]
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE, override=True)


class AuthService:
    def __init__(self, repository=None):
        self.repository = repository or UserRepository()

        self.secret_key = os.environ.get("JWT_SECRET_KEY")

        if not self.secret_key:
            raise RuntimeError(
                "JWT_SECRET_KEY chưa được cấu hình trong file .env"
            )

        self.expires_minutes = int(
            os.environ.get(
                "JWT_ACCESS_TOKEN_EXPIRES_MINUTES",
                "60"
            )
        )

    def verify_password(self, password: str, password_hash: str) -> bool:
        if not password_hash:
            return False

        # 1. Kiểm tra bằng bcrypt nếu hash bắt đầu bằng $2
        if password_hash.startswith("$2") and bcrypt is not None:
            try:
                return bcrypt.checkpw(
                    password.encode("utf-8"),
                    password_hash.encode("utf-8")
                )
            except Exception:
                pass

        # 2. Fallback kiểm tra werkzeug (scrypt, pbkdf2, sha256)
        try:
            return check_password_hash(password_hash, password)
        except Exception:
            pass

        return False

    def login(self, email: str, password: str):
        user = self.repository.get_by_email(email)

        if not user:
            raise ValueError("Email hoặc mật khẩu không đúng.")

        if not self.verify_password(
            password,
            user.password_hash
        ):
            raise ValueError("Email hoặc mật khẩu không đúng.")

        if user.status != "APPROVED":
            raise ValueError(
                f"Tài khoản chưa được phép đăng nhập. Status: {user.status}"
            )

        access_token = self.create_access_token(user)

        return {
            "access_token": access_token,
            "token_type": "Bearer",
            "expires_in": self.expires_minutes * 60,
            "user": user.to_dict(),
        }

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

        return jwt.encode(
            payload,
            self.secret_key,
            algorithm="HS256"
        )

    def decode_access_token(self, token: str):
        try:
            return jwt.decode(
                token,
                self.secret_key,
                algorithms=["HS256"]
            )

        except jwt.ExpiredSignatureError:
            raise ValueError("JWT đã hết hạn.")

        except jwt.InvalidTokenError:
            raise ValueError("JWT không hợp lệ.")