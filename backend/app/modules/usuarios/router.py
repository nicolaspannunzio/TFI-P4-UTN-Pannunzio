from typing import List
from fastapi import APIRouter, Depends
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (Admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=List[UserPublic])
def listar_usuarios(
    _admin: Usuario = Depends(require_role("admin")),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.list_usuarios()


@router.post("/{id}/activar", response_model=UserPublic)
def activar_usuario(
    id: int,
    _admin: Usuario = Depends(require_role("admin")),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.activar_usuario(id)


@router.post("/{id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    id: int,
    admin: Usuario = Depends(require_role("admin")),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.desactivar_usuario(id, admin.id)  # type: ignore[arg-type]