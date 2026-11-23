from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router

# Importar todos los modelos para registrarlos en SQLModel.metadata
from app.modules.usuarios.models import Usuario  # noqa: F401
from app.modules.categorias.models import Categoria  # noqa: F401
from app.modules.productos.models import Producto  # noqa: F401
from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router
from app.modules.pedidos.router import router as pedidos_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="Sistema de pedidos de comida - TPI Programación 4 (UTN)",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(usuarios_router, prefix=API_PREFIX)
app.include_router(categorias_router, prefix=API_PREFIX)
app.include_router(productos_router, prefix=API_PREFIX)
app.include_router(pedidos_router, prefix=API_PREFIX)


@app.get("/health", tags=["Sistema"])
def health_check():
    return {"status": "ok"}