from typing import List, Optional, Tuple
from sqlalchemy import func
from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_active_by_id(self, producto_id: int) -> Optional[Producto]:
        statement = select(Producto).where(
            Producto.id == producto_id,
            Producto.activo == True,  # noqa: E712
        )
        return self.session.exec(statement).first()

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> Tuple[int, List[Producto]]:
        base_query = select(Producto).where(Producto.activo == True)  # noqa: E712
        count_query = select(func.count()).select_from(Producto).where(Producto.activo == True)  # noqa: E712

        if search:
            pattern = f"%{search.strip()}%"
            base_query = base_query.where(Producto.nombre.ilike(pattern))  # type: ignore[attr-defined]
            count_query = count_query.where(Producto.nombre.ilike(pattern))  # type: ignore[attr-defined]

        if categoria_id is not None:
            base_query = base_query.where(Producto.categoria_id == categoria_id)
            count_query = count_query.where(Producto.categoria_id == categoria_id)

        if disponible is not None:
            base_query = base_query.where(Producto.disponible == disponible)
            count_query = count_query.where(Producto.disponible == disponible)

        total = int(self.session.exec(count_query).one())
        items = list(
            self.session.exec(
                base_query.order_by(Producto.id).offset(skip).limit(limit)  # type: ignore[arg-type]
            ).all()
        )
        return total, items