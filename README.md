# FullComponents Store — React + Vite + microservicios Spring Boot

Versión revisada a partir del frontend HTML original, React entregado y microservicios recibidos.

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

Con `false`, la API usa el Gateway. No hay datos de ejemplo inyectados automáticamente en MySQL; debes haber ejecutado previamente tus cargas de catálogo, inventario y usuarios. Para trabajar sin los microservicios puedes cambiar temporalmente a `VITE_USE_MOCK=true` y reiniciar Vite; los datos serán simulados.

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

Los endpoints de pago/despacho son consumidos por ServicePedidos, no directamente por el navegador.

**Importante sobre administración:** se muestra al usuario autenticado con rol Administrador; los endpoints Spring entregados todavía no imponen autorización de roles, por lo que la seguridad de estas operaciones necesita trabajo en el backend. No uses este sistema con usuarios reales sin resolver esa brecha. Los usuarios se pueden consultar y editar; para eliminarlos habría que añadir un endpoint en Usuarios.

## Diseño y criterios

- Imágenes con `object-fit: contain` en fichas, categorías y tarjetas; carrusel responsivo sin superposiciones.
- Se recuperaron secciones y clases del HTML original: categorías principales, banners, destacados, selección, beneficios y footer.
- Se conservaron nombres de imágenes y recursos `public/img` del React proporcionado.
- Consulta el detalle de las historias de usuario en `documents/CRITERIOS_ACEPTACION_REVISADOS.md` y el Excel original.

## Verificación

Se ejecutaron validaciones estáticas de sintaxis JavaScript/JSX, CSS y rutas a imágenes. **No fue posible completar `npm run build` ni las pruebas con Chrome en este entorno**: el ZIP tenía dependencias instaladas para otra plataforma y no se pudo resolver la dependencia nativa de Vite 8. Tampoco se iniciaron tus servicios MySQL/Spring. Ejecuta `npm install`, `npm run build` y `npm test` en tu ordenador para validar el entorno real y los flujos finales.
