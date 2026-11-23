from sqlmodel import Session, select
from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario


def run_seed() -> None:
    create_all_tables()
    with Session(engine) as session:
        # 1. Usuario admin idempotente
        admin = session.exec(select(Usuario).where(Usuario.username == "admin")).first()
        if not admin:
            admin = Usuario(
                username="admin",
                full_name="Administrador Food Store",
                email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"),
                role="admin",
                disabled=False,
            )
            session.add(admin)
            session.commit()
            session.refresh(admin)
            print("Admin creado: admin / Admin1234!")
        else:
            print("Admin ya existente.")

        # 2. Categorías idempotentes (al menos 3)
        categorias_data = [
            {"nombre": "Hamburguesas", "descripcion": "Hamburguesas artesanales a la parrilla"},
            {"nombre": "Pizzas", "descripcion": "Pizzas a la piedra con masa madre"},
            {"nombre": "Bebidas", "descripcion": "Gaseosas, aguas y cervezas artesanales"},
            {"nombre": "Postres", "descripcion": "Opciones dulces para cerrar el pedido"},
        ]
        categorias_map: dict[str, Categoria] = {}
        for cat_info in categorias_data:
            cat = session.exec(
                select(Categoria).where(Categoria.nombre == cat_info["nombre"])
            ).first()
            if not cat:
                cat = Categoria(
                    nombre=cat_info["nombre"],
                    descripcion=cat_info["descripcion"],
                    activo=True,
                )
                session.add(cat)
                session.commit()
                session.refresh(cat)
            categorias_map[cat.nombre] = cat

        # 3. Productos idempotentes (al menos 8 con stock)
        productos_data = [
            {
                "categoria": "Hamburguesas",
                "nombre": "Hamburguesa Clásica",
                "descripcion": "Medallón 180g, cheddar, lechuga, tomate y salsa especial.",
                "precio_base": 8500.0,
                "imagen_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
                "stock": 25,
            },
            {
                "categoria": "Hamburguesas",
                "nombre": "Hamburguesa Doble Bacon",
                "descripcion": "Doble carne, doble cheddar, panceta crocante y barbacoa.",
                "precio_base": 10800.0,
                "imagen_url": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600",
                "stock": 20,
            },
            {
                "categoria": "Hamburguesas",
                "nombre": "Hamburguesa Veggie",
                "descripcion": "Medallón de lentejas y hongos, palta, rúcula y alioli.",
                "precio_base": 8200.0,
                "imagen_url": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600",
                "stock": 15,
            },
            {
                "categoria": "Pizzas",
                "nombre": "Pizza Muzzarella",
                "descripcion": "Salsa de tomate natural, abundante muzzarella y orégano.",
                "precio_base": 9500.0,
                "imagen_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
                "stock": 18,
            },
            {
                "categoria": "Pizzas",
                "nombre": "Pizza Napolitana",
                "descripcion": "Muzzarella, rodajas de tomate fresco, ajo y albahaca.",
                "precio_base": 10500.0,
                "imagen_url": "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=600",
                "stock": 14,
            },
            {
                "categoria": "Pizzas",
                "nombre": "Pizza Pepperoni",
                "descripcion": "Muzzarella fundida y pepperoni levemente picante.",
                "precio_base": 11500.0,
                "imagen_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600",
                "stock": 12,
            },
            {
                "categoria": "Bebidas",
                "nombre": "Gaseosa Cola 500ml",
                "descripcion": "Botella fría 500ml.",
                "precio_base": 2500.0,
                "imagen_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600",
                "stock": 50,
            },
            {
                "categoria": "Bebidas",
                "nombre": "Agua Mineral 500ml",
                "descripcion": "Agua mineral sin gas 500ml.",
                "precio_base": 2000.0,
                "imagen_url": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600",
                "stock": 40,
            },
            {
                "categoria": "Postres",
                "nombre": "Brownie con Helado",
                "descripcion": "Brownie tibio de chocolate con bocha de crema americana.",
                "precio_base": 4800.0,
                "imagen_url": "https://images.unsplash.com/photo-1564355808532-22fda35bed7e?w=600",
                "stock": 16,
            },
        ]

        for prod_info in productos_data:
            existente = session.exec(
                select(Producto).where(Producto.nombre == prod_info["nombre"])
            ).first()
            if not existente:
                cat = categorias_map[prod_info["categoria"]]
                prod = Producto(
                    categoria_id=cat.id,  # type: ignore[arg-type]
                    nombre=prod_info["nombre"],
                    descripcion=prod_info["descripcion"],
                    precio_base=prod_info["precio_base"],
                    imagen_url=prod_info["imagen_url"],
                    stock=prod_info["stock"],
                    disponible=True,
                    activo=True,
                )
                session.add(prod)
        session.commit()
        print("Seed de Food Store completado con éxito.")


if __name__ == "__main__":
    run_seed()