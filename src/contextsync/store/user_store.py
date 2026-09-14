import sqlite3
import hashlib
import os
import secrets
import jwt
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional, Dict, Any

SECRET_KEY = os.getenv("CORTEX_JWT_SECRET", "contextsync-super-secret-jwt-key-2026")
ALGORITHM = "HS256"

class UserStore:
    """Manages multi-tenant users, password authentication, and API keys."""

    def __init__(self, db_path: Path):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    plan TEXT DEFAULT 'free',
                    api_key TEXT UNIQUE NOT NULL,
                    created_at TEXT NOT NULL
                )
            """)
            conn.commit()

    def _hash_password(self, password: str, salt: Optional[str] = None) -> str:
        if not salt:
            salt = secrets.token_hex(16)
        key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return f"{salt}${key.hex()}"

    def _verify_password(self, password: str, stored_hash: str) -> bool:
        try:
            salt, _ = stored_hash.split("$", 1)
            return self._hash_password(password, salt) == stored_hash
        except Exception:
            return False

    def create_user(self, email: str, password: str) -> Dict[str, Any]:
        """Register a new user with a hashed password and generated API key."""
        email_clean = email.strip().lower()
        user_id = secrets.token_hex(12)
        pwd_hash = self._hash_password(password)
        api_key = f"ctx_live_{secrets.token_hex(16)}"
        created_at = datetime.now(timezone.utc).isoformat()

        with self._get_conn() as conn:
            cursor = conn.cursor()
            try:
                cursor.execute("""
                    INSERT INTO users (id, email, password_hash, plan, api_key, created_at)
                    VALUES (?, ?, ?, 'free', ?, ?)
                """, (user_id, email_clean, pwd_hash, api_key, created_at))
                conn.commit()
            except sqlite3.IntegrityError:
                raise ValueError("An account with this email already exists.")

        return {
            "id": user_id,
            "email": email_clean,
            "plan": "free",
            "api_key": api_key,
            "created_at": created_at
        }

    def authenticate(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Verify email and password; return user dict if valid."""
        email_clean = email.strip().lower()
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email_clean,))
            row = cursor.fetchone()
            if not row:
                return None
            if not self._verify_password(password, row["password_hash"]):
                return None

            return {
                "id": row["id"],
                "email": row["email"],
                "plan": row["plan"],
                "api_key": row["api_key"],
                "created_at": row["created_at"]
            }

    def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve user by ID."""
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, email, plan, api_key, created_at FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return dict(row)

    def get_by_api_key(self, api_key: str) -> Optional[Dict[str, Any]]:
        """Verify API key from Cursor / MCP client."""
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, email, plan, api_key, created_at FROM users WHERE api_key = ?", (api_key,))
            row = cursor.fetchone()
            if not row:
                return None
            return dict(row)

    def create_jwt_token(self, user_id: str, email: str) -> str:
        """Create a 30-day JWT session token."""
        expires = datetime.now(timezone.utc) + timedelta(days=30)
        payload = {
            "sub": user_id,
            "email": email,
            "exp": int(expires.timestamp())
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    def verify_jwt_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except Exception:
            return None
