from typing import Callable, Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from app.core.config import settings
from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario


class OAuth2PasswordBearerCookie(OAuth2PasswordBearer):
    async def __call__(self, request: Request) -> Optional[str]:
        token = request.cookies.get(settings.COOKIE_NAME)
        if token:
            return token
        return await super().__call__(request)


oauth2_scheme = OAuth2PasswordBearerCookie(tokenUrl="/api/v1/auth/token", auto_error=False)


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado o sesión vencida",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    username = decode_access_token(token)
    if not username:
        raise credentials_exception
    user = session.exec(select(Usuario).where(Usuario.username == username)).first()
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(user: Usuario = Depends(get_current_user)) -> Usuario:
    if user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return user


def require_role(*roles: str) -> Callable[[Usuario], Usuario]:
    def checker(user: Usuario = Depends(get_current_active_user)) -> Usuario:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para esta operación",
            )
        return user

    return checker