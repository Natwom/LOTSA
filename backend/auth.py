from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
from . import models, database
from .config import SECRET_KEY, ALGORITHM

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# ===================================================================
# FIX: bcrypt has a 72-byte limit. Truncate passwords before hashing/verifying.
# ===================================================================
def _truncate_password(password: str) -> bytes:
    """Truncate password to 72 bytes to avoid bcrypt ValueError."""
    return password.encode('utf-8')[:72]

def verify_password(plain_password, hashed_password):
    secret = _truncate_password(plain_password)
    return pwd_context.verify(secret, hashed_password)

def get_password_hash(password):
    secret = _truncate_password(password)
    return pwd_context.hash(secret)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # CRITICAL: Eager-load profile so current_user.profile is available everywhere
    user = db.query(models.User).options(
        joinedload(models.User.profile)
    ).filter(models.User.id == int(user_id)).first()

    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_admin(current_user: models.User = Depends(get_current_active_user)):
    role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    if role not in ['admin', 'leader']:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user