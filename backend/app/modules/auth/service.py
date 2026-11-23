from fastapi import HTTPException, status
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def register(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El nombre de usuario ya está registrado",
                )
            if uow.usuarios.get_by_email(str(data.email)):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El email ya está registrado",
                )
            nuevo = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=str(data.email),
                hashed_password=hash_password(data.password),
                role="user",
                disabled=False,
            )
            creado = uow.usuarios.add(nuevo)
            return UserPublic.model_validate(creado)

    def authenticate_and_create_token(self, username: str, password: str) -> str:
        with self.uow as uow:
            user = uow.usuarios.get_by_username(username)
            if not user or not verify_password(password, user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciales incorrectas",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            if user.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cuenta de usuario desactivada",
                )
            return create_access_token(subject=user.username)