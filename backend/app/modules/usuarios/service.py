from typing import List
from fastapi import HTTPException, status
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def list_usuarios(self) -> List[UserPublic]:
        with self.uow as uow:
            users = uow.usuarios.get_all(skip=0, limit=1000)
            return [UserPublic.model_validate(u) for u in users]

    def activar_usuario(self, user_id: int) -> UserPublic:
        with self.uow as uow:
            user = uow.usuarios.get_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado",
                )
            user.disabled = False
            uow.usuarios.add(user)
            return UserPublic.model_validate(user)

    def desactivar_usuario(self, user_id: int, current_admin_id: int) -> UserPublic:
        if user_id == current_admin_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un administrador no puede desactivarse a sí mismo",
            )
        with self.uow as uow:
            user = uow.usuarios.get_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado",
                )
            user.disabled = True
            uow.usuarios.add(user)
            return UserPublic.model_validate(user)