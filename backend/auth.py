from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .database import get_db
from .models import User, UserRole
from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def verify_password(plain_password, hashed_password):
    print(f"[VERIFY_PASSWORD] raw len={len(plain_password)} chars")
    plain_bytes = plain_password.encode('utf-8')[:72]
    print(f"[VERIFY_PASSWORD] truncated to {len(plain_bytes)} bytes")
    try:
        result = pwd_context.verify(plain_bytes, hashed_password)
        print(f"[VERIFY_PASSWORD] bcrypt result={result}")
        return result
    except Exception as e:
        print(f"[VERIFY_PASSWORD] bcrypt ERROR: {type(e).__name__}: {e}")
        raise

def get_password_hash(password):
    print(f"[GET_PASSWORD_HASH] raw len={len(password)} chars")
    plain_bytes = password.encode('utf-8')[:72]
    print(f"[GET_PASSWORD_HASH] truncated to {len(plain_bytes)} bytes")
    try:
        hashed = pwd_context.hash(plain_bytes)
        print(f"[GET_PASSWORD_HASH] success, hash len={len(hashed)}")
        return hashed
    except Exception as e:
        print(f"[GET_PASSWORD_HASH] bcrypt ERROR: {type(e).__name__}: {e}")
        raise

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_admin(current_user: User = Depends(get_current_active_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.LEADER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user