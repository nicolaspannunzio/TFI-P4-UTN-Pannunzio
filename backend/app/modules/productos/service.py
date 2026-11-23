from typing import Optional
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p) for p in items],
            )

    def get_by_id(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")
            return ProductoRead.model_validate(producto)

    def create(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(data.categoria_id)
            if not categoria:
                raise CategoriaNoEncontrada("La categoría no existe o está dada de baja")

            nuevo = Producto(
                nombre=data.nombre,
                descripcion=data.descripcion,
                precio_base=data.precio_base,
                imagen_url=data.imagen_url,
                stock=data.stock,
                disponible=data.disponible,
                categoria_id=data.categoria_id,
                activo=True,
            )
            creado = uow.productos.add(nuevo)
            return ProductoRead.model_validate(creado)

    def update(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")

            update_data = data.model_dump(exclude_unset=True)
            if "categoria_id" in update_data and update_data["categoria_id"] is not None:
                categoria = uow.categorias.get_active_by_id(update_data["categoria_id"])
                if not categoria:
                    raise CategoriaNoEncontrada("La nueva categoría no existe o está dada de baja")

            for key, value in update_data.items():
                setattr(producto, key, value)

            actualizado = uow.productos.add(producto)
            return ProductoRead.model_validate(actualizado)

    def update_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")

            producto.stock = data.stock
            producto.disponible = data.disponible
            actualizado = uow.productos.add(producto)
            return ProductoRead.model_validate(actualizado)

    def delete(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_active_by_id(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")

            producto.activo = False
            uow.productos.add(producto)