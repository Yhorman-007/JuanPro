from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Schema compartido
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    is_admin: Optional[bool] = False

# Registro de usuario (entrada)
class UserCreate(UserBase):
    password: str

# Actualización de usuario (entrada)
class UserUpdate(BaseModel):
    id: int
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None

# Respuesta de usuario (salida)
class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
