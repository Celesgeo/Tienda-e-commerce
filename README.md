# Backend Ecommerce (Node.js + Express + MongoDB)

Backend con arquitectura MVC para ecommerce, con JWT, CRUDs, órdenes y Cloudinary.

## Instalación

1. Crear `.env` en la raíz (no se sube a Git) con las variables del panel de hosting o las que uses en local.
2. Instalar dependencias:
   - `npm install`
3. Comprobar MongoDB (recomendado):
   - `npm run check-mongo` → debe mostrar **conectado** y el nombre de la base.
4. Ejecutar en desarrollo:
   - `npm run dev` (en consola del API debería aparecer **MongoDB conectado**)

## Scripts

- `npm run dev`: inicia con nodemon.
- `npm start`: inicia en modo producción.
- `npm run check-mongo`: prueba `MONGO_URI` y conexión a la base (sin levantar el servidor).
- `npm run list-users`: lista emails y rol `admin` / `customer` en la base actual.
- `npm run seed`: carga categorías y productos de ejemplo.
- `npm run promote-admin -- admin@tudominio.com`: asigna `role: admin` a un usuario **ya registrado**.
- `npm run create-admin -- admin@tudominio.com "Contraseña123"`: crea el usuario admin si no existe (ideal para el primer acceso al panel). Si el email ya existe, solo lo promueve a admin.

### Error 403 en el panel

El panel solo acepta usuarios con **`role: "admin"`** en MongoDB. Si ves *Request failed with status code 403*: si ya tenés cuenta, ejecutá `promote-admin` con tu email; si no, ejecutá `create-admin` con email y contraseña. Luego cerrá sesión y volvé a entrar.

## Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Categorías
- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories` (admin)
- `PUT /api/categories/:id` (admin)
- `DELETE /api/categories/:id` (admin)

### Productos
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin, multipart con `image`)
- `PUT /api/products/:id` (admin, multipart con `image`)
- `DELETE /api/products/:id` (admin)

### Cupones
- `GET /api/coupons` (admin)
- `GET /api/coupons/:id` (admin)
- `POST /api/coupons` (admin)
- `PUT /api/coupons/:id` (admin)
- `DELETE /api/coupons/:id` (admin)

### Órdenes
- `POST /api/orders` (usuario autenticado)
- `GET /api/orders/mine` (usuario autenticado)
- `GET /api/orders` (admin)
- `PUT /api/orders/:id/status` (admin)

### Store (branding dinámico)
- `GET /api/store`
- `PUT /api/store` (admin, multipart con `logo`)

### Slides (carrusel dinámico)
- `GET /api/slides`
- `POST /api/slides` (admin, multipart con `image`)
- `PUT /api/slides/:id` (admin, multipart opcional)
- `PUT /api/slides/:id/reorder` (admin)
- `PUT /api/slides/reorder` (admin, bulk drag and drop)
- `DELETE /api/slides/:id` (admin)

## Seguridad y producción

- `CORS_ORIGIN`: dominios permitidos separados por coma.
- `RATE_LIMIT_WINDOW_MS`: ventana del rate limit en ms.
- `RATE_LIMIT_MAX`: máximo de requests por IP en la ventana.
- `helmet` habilitado para headers de seguridad.
- `express-rate-limit` aplicado sobre `/api`.

## Deploy en Railway (2 servicios + Atlas)

### 1. MongoDB Atlas

- Cluster activo y usuario con contraseña.
- **Network Access** → agregar `0.0.0.0/0` (Railway no tiene IP fija).
- Copiar `MONGO_URI` (misma que en tu `.env` local).

### 2. Proyecto Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → repo `Tienda-e-commerce`.
2. Crear **dos servicios** desde el mismo repo (botón **+ New** → **GitHub Repo** o duplicar servicio).

### 3. Servicio **backend** (raíz del repo)

| Campo | Valor |
|--------|--------|
| Root Directory | *(vacío o `.`)* |
| Build | automático (`npm install`) |
| Start | `npm start` |
| Healthcheck | `/api/health` |

**Variables** (pestaña Variables):

| Variable | Ejemplo / notas |
|----------|------------------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | URI de Atlas |
| `JWT_SECRET` | string largo aleatorio |
| `CORS_ORIGIN` | URL del frontend (sin barra final) |
| `FRONTEND_URL` | misma URL del frontend |
| `BACKEND_URL` | URL pública del backend |
| `CLOUDINARY_CLOUD_NAME` | |
| `CLOUDINARY_API_KEY` | |
| `CLOUDINARY_API_SECRET` | |
| `MERCADOPAGO_ACCESS_TOKEN` | opcional hasta activar pagos |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX` | `200` |

**Settings → Networking → Generate Domain** → copiar URL (ej. `https://tienda-api-production.up.railway.app`).

Probar: `https://TU-BACKEND/api/health` → debe responder `{ "ok": true }`.

### 4. Servicio **frontend** (`frontend/`)

| Campo | Valor |
|--------|--------|
| Root Directory | `frontend` |
| Build | `npm install && npm run build` |
| Start | `npm run start` |

**Variables** (importante: se usan en el **build**):

| Variable | Valor |
|----------|--------|
| `VITE_API_URL` | `https://TU-BACKEND/api` (con `/api` al final) |

**Generate Domain** para el frontend.

### 5. Enlazar URLs (redeploy backend)

Volver al servicio **backend** y actualizar:

- `CORS_ORIGIN` = URL del frontend (solo una, o varias separadas por coma)
- `FRONTEND_URL` = URL del frontend
- `BACKEND_URL` = URL del backend

**Redeploy** backend y frontend (frontend solo si cambiaste `VITE_API_URL`).

### 6. Admin en producción

En tu PC, con `MONGO_URI` de Atlas en `.env`:

```bash
npm run create-admin -- tu@email.com "TuContraseñaSegura"
```

Luego entrá a `https://TU-FRONTEND/admin/login`.

### 7. Mercado Pago (después)

Webhook: `https://TU-BACKEND/api/payments/mercadopago/webhook`  
URLs de retorno: las arma el backend con `FRONTEND_URL`.

## Estructura

```txt
src/
  app.js
  server.js
  config/
    db.js
    cloudinary.js
  controllers/
  middlewares/
  models/
  routes/
  seeds/
  utils/
```
