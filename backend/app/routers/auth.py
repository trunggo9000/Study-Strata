"""
Authentication and authorization API endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, timedelta
import logging
import jwt
from passlib.context import CryptContext

from ..core.config import settings
from ..core.database import get_db_manager

logger = logging.getLogger(__name__)
router = APIRouter()

# Security setup
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserLogin(BaseModel):
    """User login model."""
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    """User registration model."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    major_id: Optional[str] = None
    academic_year: Optional[str] = None

class TokenResponse(BaseModel):
    """Token response model."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_info: Dict[str, Any]

class UserProfile(BaseModel):
    """User profile model."""
    id: str
    email: str
    full_name: str
    major_id: Optional[str] = None
    academic_year: Optional[str] = None
    graduation_goal: Optional[str] = None
    preferences: Dict[str, Any] = Field(default_factory=dict)
    created_at: str
    updated_at: str

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None):
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash password."""
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user."""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/register", response_model=TokenResponse)
async def register_user(user_data: UserRegister):
    """Register a new user."""
    try:
        db_manager = get_db_manager()
        client = db_manager.get_client(service=True)
        
        # Check if user already exists
        existing_user = client.table('profiles').select('*').eq('email', user_data.email).execute()
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user profile
        user_profile = {
            "email": user_data.email,
            "full_name": user_data.full_name,
            "major_id": user_data.major_id,
            "academic_year": user_data.academic_year,
            "preferences": {},
            "password_hash": hashed_password
        }
        
        # Insert user (simplified - in real app would use Supabase Auth)
        result = client.table('profiles').insert(user_profile).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        user = result.data[0]
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["id"]}, expires_delta=access_token_expires
        )
        
        return TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_info={
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "major_id": user.get("major_id"),
                "academic_year": user.get("academic_year")
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=TokenResponse)
async def login_user(user_credentials: UserLogin):
    """Authenticate user and return access token."""
    try:
        db_manager = get_db_manager()
        client = db_manager.get_client(service=True)
        
        # Get user by email
        user_result = client.table('profiles').select('*').eq('email', user_credentials.email).execute()
        
        if not user_result.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        user = user_result.data[0]
        
        # Verify password
        if not verify_password(user_credentials.password, user.get('password_hash', '')):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["id"]}, expires_delta=access_token_expires
        )
        
        return TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_info={
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "major_id": user.get("major_id"),
                "academic_year": user.get("academic_year")
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(current_user: str = Depends(get_current_user)):
    """Get current user's profile."""
    try:
        db_manager = get_db_manager()
        client = db_manager.get_client()
        
        # Get user profile
        result = client.table('profiles').select('*').eq('id', current_user).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        user = result.data[0]
        
        return UserProfile(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            major_id=user.get("major_id"),
            academic_year=user.get("academic_year"),
            graduation_goal=user.get("graduation_goal"),
            preferences=user.get("preferences", {}),
            created_at=user["created_at"],
            updated_at=user["updated_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user profile"
        )

@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    profile_updates: Dict[str, Any],
    current_user: str = Depends(get_current_user)
):
    """Update current user's profile."""
    try:
        db_manager = get_db_manager()
        client = db_manager.get_client()
        
        # Update user profile
        result = client.table('profiles').update(profile_updates).eq('id', current_user).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        user = result.data[0]
        
        return UserProfile(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            major_id=user.get("major_id"),
            academic_year=user.get("academic_year"),
            graduation_goal=user.get("graduation_goal"),
            preferences=user.get("preferences", {}),
            created_at=user["created_at"],
            updated_at=user["updated_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile"
        )

@router.post("/logout")
async def logout_user(current_user: str = Depends(get_current_user)):
    """Logout current user (invalidate token)."""
    try:
        # In a real implementation, you would add the token to a blacklist
        # For now, just return success message
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        logger.error(f"Error logging out user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

@router.post("/refresh-token")
async def refresh_access_token(current_user: str = Depends(get_current_user)):
    """Refresh user's access token."""
    try:
        # Create new access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": current_user}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
        
    except Exception as e:
        logger.error(f"Error refreshing token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str = Field(..., min_length=8),
    current_user: str = Depends(get_current_user)
):
    """Change user's password."""
    try:
        db_manager = get_db_manager()
        client = db_manager.get_client(service=True)
        
        # Get current user
        user_result = client.table('profiles').select('*').eq('id', current_user).execute()
        
        if not user_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user = user_result.data[0]
        
        # Verify current password
        if not verify_password(current_password, user.get('password_hash', '')):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        new_password_hash = get_password_hash(new_password)
        
        # Update password
        client.table('profiles').update({
            'password_hash': new_password_hash
        }).eq('id', current_user).execute()
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error changing password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )
