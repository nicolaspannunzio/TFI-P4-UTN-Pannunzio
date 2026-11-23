from typing import List
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def list_activas(self) -> List[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.list_activas()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def get_by_id(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)
            if not categoria:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            return CategoriaRead.model_validate(categoria)

    def create(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            # La baja lógica de una categoría no libera su nombre único (convenciones p. 10)
            if uow.categorias.get_by_nombre(data.nombre):
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            nueva = Categoria(
                nombre=data.nombre,
                descripcion=data.descripcion,
                activo=True,
            )
            creada = uow.categorias.add(nueva)
            return CategoriaRead.model_validate(creada)

    def update(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)
            if not categoria:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            update_data = data.model_dump(exclude_unset=True)
            if "nombre" in update_data and update_data["nombre"] != categoria.nombre:
                if uow.categorias.get_by_nombre(update_data["nombre"]):
                    raise NombreDuplicado("Ya existe una categoría con ese nombre")

            for key, value in update_data.items():
                setattr(categoria, key, value)

            actualizada = uow.categorias.add(categoria)
            return CategoriaRead.model_validate(actualizada)

    def delete(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_active_by_id(categoria_id)
            if not categoria:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            categoria.activo = False
            uow.categorias.add(categoria)