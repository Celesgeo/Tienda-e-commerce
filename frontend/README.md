# Frontend Ecommerce (React + Vite + Tailwind)

Frontend ecommerce con tienda publica y panel administrador.

## Instalacion

1. `cp env.template .env`
2. `npm install`
3. `npm run dev`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`

## Modulos

- **Tienda**: home, categorias, detalle de producto, carrito, wishlist y checkout WhatsApp.
- **Admin**:
  - `/admin/login`
  - `/admin`
  - `/admin/productos`
  - `/admin/categorias`
  - `/admin/cupones`

## Integracion backend

- Configurar `VITE_API_URL` en `.env`.
- El panel admin usa login JWT y endpoints protegidos.
