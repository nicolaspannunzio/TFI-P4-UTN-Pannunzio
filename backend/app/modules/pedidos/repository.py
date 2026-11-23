from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from sqlalchemy import func
from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        self.session.refresh(detalle)
        return detalle

    def list_by_usuario(
        self,
        usuario_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None,
    ) -> Tuple[int, List[Pedido]]:
        base_query = select(Pedido)
        count_query = select(func.count()).select_from(Pedido)

        if usuario_id is not None:
            base_query = base_query.where(Pedido.usuario_id == usuario_id)
            count_query = count_query.where(Pedido.usuario_id == usuario_id)

        if estado is not None:
            base_query = base_query.where(Pedido.estado == estado)
            count_query = count_query.where(Pedido.estado == estado)

        total = int(self.session.exec(count_query).one())
        items = list(
            self.session.exec(
                base_query.order_by(Pedido.id.desc()).offset(skip).limit(limit)  # type: ignore[union-attr]
            ).all()
        )
        return total, items

    def count_by_estado(self) -> Dict[str, int]:
        statement = select(Pedido.estado, func.count()).group_by(Pedido.estado)
        rows = self.session.exec(statement).all()
        counts = {
            "PENDIENTE": 0,
            "EN_PREPARACION": 0,
            "ENTREGADO": 0,
            "CANCELADO": 0,
        }
        for estado_nombre, cantidad in rows:
            counts[estado_nombre] = int(cantidad)
        return counts

    def count_pedidos_hoy(self) -> int:
        ahora = datetime.now(timezone.utc)
        inicio_dia = ahora.replace(hour=0, minute=0, second=0, microsecond=0)
        statement = select(func.count()).select_from(Pedido).where(Pedido.created_at >= inicio_dia)
        return int(self.session.exec(statement).one())

    def sum_ingresos_entregados(self) -> float:
        statement = select(func.coalesce(func.sum(Pedido.total), 0.0)).where(
            Pedido.estado == "ENTREGADO"
        )
        return float(self.session.exec(statement).one())