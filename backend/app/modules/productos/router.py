from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    categoria_id: Optional[int] = Query(default=None),
    disponible: Optional[bool] = Query(default=None),
    service: ProductoService = Depends(get_producto_service),
):
    return service.search(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get("/{id}", response_model=ProductoRead)
def detalle_producto(
    id: int,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.get_by_id(id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(
    data: ProductoCreate,
    _admin: Usuario = Depends(require_role("admin")),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.create(data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/{id}", response_model=ProductoRead)
def actualizar_producto(
    id: int,
    data: ProductoUpdate,
    _admin: Usuario = Depends(require_role("admin")),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.update(id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{id}/stock", response_model=ProductoRead)
def actualizar_stock_producto(
    id: int,
    data: ProductoStockUpdate,
    _admin: Usuario = Depends(require_role("admin")),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.update_stock(id, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    id: int,
    _admin: Usuario = Depends(require_role("admin")),
    service: ProductoService = Depends(get_producto_service),
):
    try:
        service.delete(id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))