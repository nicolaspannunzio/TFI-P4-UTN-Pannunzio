from datetime import datetime, timezone
from typing import Dict, List, Optional
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


TRANSICIONES_VALIDAS: Dict[str, List[str]] = {
    "PENDIENTE": ["EN_PREPARACION", "CANCELADO"],
    "EN_PREPARACION": ["ENTREGADO", "CANCELADO"],
    "ENTREGADO": [],
    "CANCELADO": [],
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def crear_pedido(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        with self.uow as uow:
            # RN-01: ningún producto repetido entre los ítems
            ids_vistos = set()
            for item in data.items:
                if item.producto_id in ids_vistos:
                    raise ProductoRepetido(
                        f"El producto con id {item.producto_id} está repetido en el pedido"
                    )
                ids_vistos.add(item.producto_id)

            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0,
            )
            pedido = uow.pedidos.add(pedido)

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_active_by_id(item.producto_id)
                if not producto:
                    raise ProductoNoEncontrado(
                        f"Producto con id {item.producto_id} no encontrado o inactivo"
                    )
                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no está disponible"
                    )
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}' (disponible: {producto.stock})"
                    )

                # Descuento de stock y creación de línea inmutable (RN-01, RN-05)
                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                detalle = DetallePedido(
                    pedido_id=pedido.id,  # type: ignore[arg-type]
                    producto_id=producto.id,  # type: ignore[arg-type]
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.pedidos.add_detalle(detalle)
                total = round(total + subtotal, 2)

            pedido.total = total
            pedido.updated_at = datetime.now(timezone.utc)
            pedido = uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def listar_pedidos(
        self,
        usuario: Usuario,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            filtro_usuario = None if usuario.role == "admin" else usuario.id
            total, items = uow.pedidos.list_by_usuario(
                usuario_id=filtro_usuario,
                skip=skip,
                limit=limit,
                estado=estado,
            )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in items],
            )

    def obtener_detalle(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No tenés permiso para ver este pedido")
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")

            permitidos = TRANSICIONES_VALIDAS.get(pedido.estado, [])
            if data.estado not in permitidos:
                raise TransicionInvalida(
                    f"No se puede pasar de {pedido.estado} a {data.estado}"
                )

            if data.estado == "CANCELADO":
                self._restituir_stock(uow, pedido)

            pedido.estado = data.estado
            pedido.updated_at = datetime.now(timezone.utc)
            actualizado = uow.pedidos.add(pedido)
            return PedidoRead.model_validate(actualizado)

    def cancelar_por_cliente(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No tenés permiso para cancelar este pedido")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    "Solo se puede cancelar un pedido en estado PENDIENTE"
                )

            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            actualizado = uow.pedidos.add(pedido)
            return PedidoRead.model_validate(actualizado)

    def obtener_resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            counts = uow.pedidos.count_by_estado()
            pedidos_hoy = uow.pedidos.count_pedidos_hoy()
            ingresos = uow.pedidos.sum_ingresos_entregados()
            return ResumenPedidos(
                pendientes=counts["PENDIENTE"],
                en_preparacion=counts["EN_PREPARACION"],
                entregados=counts["ENTREGADO"],
                cancelados=counts["CANCELADO"],
                pedidos_hoy=pedidos_hoy,
                ingresos_entregados=ingresos,
            )

    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        for linea in pedido.items:
            producto = uow.productos.get_by_id(linea.producto_id)
            if producto:
                producto.stock += linea.cantidad
                uow.productos.add(producto)