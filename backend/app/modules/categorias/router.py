from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get("", response_model=List[CategoriaRead])
def listar_categorias(service: CategoriaService = Depends(get_categoria_service)):
    return service.list_activas()


@router.get("/{id}", response_model=CategoriaRead)
def detalle_categoria(
    id: int,
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.get_by_id(id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    data: CategoriaCreate,
    _admin: Usuario = Depends(require_role("admin")),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.create(data)
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{id}", response_model=CategoriaRead)
def actualizar_categoria(
    id: int,
    data: CategoriaUpdate,
    _admin: Usuario = Depends(require_role("admin")),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.update(id, data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    id: int,
    _admin: Usuario = Depends(require_role("admin")),
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        service.delete(id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))