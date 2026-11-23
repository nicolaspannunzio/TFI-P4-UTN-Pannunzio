# Food Store — Sistema de Pedidos de Comida

Trabajo Práctico Integrador — **Programación 4** <br>
Tecnicatura Universitaria en Programación a Distancia (TUPaD) — **UTN**

**Alumno:** Nicolás A. Pannunzio

| | |
|---|---|
| **Repositorio** | https://github.com/nicolaspannunzio/TFI-P4-UTN-Pannunzio |
| **Video de demostración** | https://drive.google.com/drive/folders/1Y8SWSsWyabUmJdoPvApVUcpvFILzzAyI?usp=drive_link |

---

## Food Store
Es una aplicación web para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un carrito y confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios desde un panel.

- **Backend:** FastAPI + SQLModel + PostgreSQL, arquitectura en capas (Router → Service → Unit of Work → Repository → Model), JWT en cookie HttpOnly y roles `user` / `admin`.
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS 4, TanStack Query / Form / Table, Zustand y Axios.

---

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11, 3.12 o 3.13 (SQLModel 0.0.22 no funciona con 3.14) |
| PostgreSQL | 15 o superior (opcional: para desarrollo se puede usar SQLite) |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm`) |

---

## Estructura del proyecto

```text
.
├── backend/
│   ├── app/
│   │   ├── core/        # config, database, security, deps, unit_of_work, base_repository
│   │   ├── db/          # seed.py (idempotente)
│   │   ├── modules/     # auth, usuarios, categorias, productos, pedidos
│   │   └── main.py      # FastAPI, CORS con credenciales y routers bajo /api/v1
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── features/    # auth, categorias, productos, usuarios, pedidos
│   │   ├── routes/      # AppRouter y ProtectedRoute
│   │   ├── shared/      # api (Axios, interceptores, QueryClient), ui, components, layout
│   │   └── store/       # authStore, cartStore, notificationStore, themeStore
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Backend

### 1. Crear la base de datos (solo si se usa PostgreSQL)

```sql
CREATE DATABASE foodstore_db;
```

### 2. Instalar dependencias

```bash
cd backend
python -m venv venv
```

Activar el entorno virtual:

- Windows (PowerShell): `.\venv\Scripts\Activate.ps1`
- Linux / macOS: `source venv/bin/activate`

```bash
pip install -r requirements.txt
```

### 3. Variables de entorno

Copiar `backend/.env.example` a `backend/.env`:

```bash
cp .env.example .env        # Linux / macOS
copy .env.example .env      # Windows
```

y completar la contraseña de PostgreSQL en `DATABASE_URL`.

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql+psycopg://postgres:TU_PASSWORD@localhost:5432/foodstore_db` (o `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |
| `COOKIE_NAME` | Nombre de la cookie de sesión | `access_token` |
| `COOKIE_SECURE` | `true` solo si se sirve por HTTPS | `false` |

### 4. Cargar datos iniciales (seed)

```bash
python -m app.db.seed
```

Es idempotente (se puede ejecutar varias veces). Crea el usuario administrador, 4 categorías y 9 productos con stock.

### 5. Iniciar el servidor

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Frontend

Con el backend corriendo, en otra terminal:

### 1. Instalar dependencias

```bash
cd frontend
pnpm install
```

### 2. Variables de entorno

Copiar `frontend/.env.example` a `frontend/.env`:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API, con el prefijo `/api/v1` | `http://localhost:8000/api/v1` |

### 3. Verificar tipos y compilar

```bash
pnpm build
```

### 4. Iniciar en modo desarrollo

```bash
pnpm dev
```

Abrir **http://localhost:5173** (usar `localhost` y no `127.0.0.1`, para que la cookie HttpOnly se comparta con la API).

---

## Usuarios de prueba

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador (creado por el seed) | `admin` | `Admin1234!` |
| Cliente | Se crea desde **/register** | mínimo 8 caracteres |

---

## Funcionalidades principales

**Cliente:** registro e inicio de sesión, catálogo paginado con búsqueda y filtro por categoría, carrito persistido en el navegador, checkout con dirección y forma de pago (efectivo o transferencia), "Mis pedidos" con detalle y cancelación mientras el pedido está `PENDIENTE`.

**Administrador:** resumen con indicadores, ABM de categorías y productos (incluye stock y disponibilidad), gestión de pedidos según la máquina de estados y gestión de usuarios (activar / desactivar).

**Reglas de negocio (backend):**

- **RN-01** El pedido se crea en una sola transacción (Unit of Work): valida productos activos, disponibles, sin repetir y con stock; descuenta stock y copia `nombre_producto` y `precio_unitario` en cada línea. Si algo falla, no se persiste nada.
- **RN-02** Máquina de estados: `PENDIENTE → EN_PREPARACION | CANCELADO`, `EN_PREPARACION → ENTREGADO | CANCELADO`; `ENTREGADO` y `CANCELADO` son terminales.
- **RN-03** Al cancelar se restituye el stock en la misma transacción.
- **RN-04** El cliente solo ve y cancela sus pedidos (solo en `PENDIENTE`); el admin ve todos.
- **RN-05** Las líneas y el total no cambian después de crear el pedido.
- **RN-06** `forma_pago` ∈ {`EFECTIVO`, `TRANSFERENCIA`} y `direccion_entrega` de 5 a 200 caracteres.

**Seguridad:** el JWT viaja solo en la cookie HttpOnly `access_token` (el frontend nunca lo lee ni lo guarda). Axios usa `withCredentials` y un interceptor que limpia la sesión ante un `401` o una cuenta desactivada. `ProtectedRoute` redirige a `/login` sin sesión y a `/unauthorized` sin el rol requerido.

---

## Autor

**Nicolás A. Pannunzio** – Full Stack Developer & QA Automation

🔗 [Perfil de LinkedIn](https://www.linkedin.com/in/nicolas-a-pannunzio-/)