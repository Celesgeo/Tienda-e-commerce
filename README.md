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

## Deploy rápido (Render + Vercel + Atlas)

1. **MongoDB Atlas**: crear cluster, usuario y `MONGO_URI`.
2. **Backend (Render)**:
   - Build: `npm install`
   - Start: `npm start`
   - Variables: `NODE_ENV`, `PORT`, `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `CLOUDINARY_*`
3. **Frontend (Vercel, root `frontend/`)**:
   - Build: `npm run build`
   - Output: `dist`
   - Variable: `VITE_API_URL=https://tu-backend.onrender.com/api`

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
