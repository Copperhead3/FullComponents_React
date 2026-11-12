# FullComponents Store — React + Vite + microservicios Spring Boot


## Inicio rápido en Windows

1. Extrae el ZIP en una carpeta **independiente** del backend. Conserva tus carpetas originales.
2. Inicia MySQL y los microservicios: Usuarios `8081`, Carrito `8082`, Producto `8083`, Inventario `8084`, Despacho `8085`, Pedidos `8086`, Pago `8087` y Gateway `8090`.
3. Abre esta carpeta en VS Code y en **Terminal → Nueva terminal** ejecuta:

```powershell
npm install
npm run check
npm run dev
```

4. Abre `http://localhost:5173`. Para producción local, comprueba con `npm run build`.

**Node.js**: usa la versión compatible con Vite 8 instalada en tu equipo (Node 22.12+ o una versión 20 compatible con Vite). Si tu instalación de npm está dañada o proviene de otro sistema operativo, elimina `node_modules` y vuelve a ejecutar `npm install` **en tu propio equipo**.

## Conexión real al backend

`.env`:

```ini
VITE_API_URL=http://localhost:8090
VITE_USE_MOCK=false
```


Rutas:
- Inicio `/`, catálogo `/catalogo`, ficha `/producto/:id`, carrito `/carrito`, checkout `/checkout`.
- Acceso `/login`, compras `/mis-pedidos`, selección `/ofertas`.
- Administración `/admin`, `/admin/productos`, `/admin/pedidos`, `/admin/usuarios`.

### Contratos comprobados frente al código Java entregado

| Operación | Ruta Gateway |
|---|---|
| Catálogo público | `GET /api/v1/productos/catalogo` |
| Productos administrativos | `GET /api/v1/productos` |
| Producto | `GET /api/v1/productos/buscar/{id}` |
| Crear / actualizar / eliminar producto | `POST /api/v1/productos/crear`, `PUT /api/v1/productos/modificar/{id}`, `DELETE /api/v1/productos/eliminar/{id}` |
| Publicar y despublicar | `PUT /api/v1/productos/publicar/{id}`, `PUT /api/v1/productos/despublicar/{id}` |
| Categorías y atributos | `GET /api/v1/categorias`, `GET /api/v1/categorias/{id}/atributos` |
| Stock | `GET /api/v1/inventario/stock`, `GET /api/v1/inventario/stock/producto/{id}` |
| Acceso / clientes | `POST /usuarios/api/auth/login`, `GET/POST /usuarios/api/clientes`, `PUT /usuarios/api/clientes/{id}` |
| Carrito | `POST /api/v1/carritos/cliente/{id}`, `POST/DELETE /api/v1/carritos/cliente/{id}/items` |
| Pedido | `POST/GET /api/v1/pedidos`, `GET /api/v1/pedidos/cliente/{id}` |

