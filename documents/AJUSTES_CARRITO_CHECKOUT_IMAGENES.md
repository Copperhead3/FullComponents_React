# Ajustes de carrito, checkout e imágenes (11-11-2026)

## Pantallas
- `src/pages/Carrito.jsx`: estructura de `carrito.html` (breadcrumb, encabezado, tarjeta de productos, columnas, control de cantidades, vaciar, recomendaciones, resumen de compra). Los precios y existencias continúan viniendo de `useProductos`/ServiceProducto y ServiceInventario; el carrito sigue utilizando `CartContext`.
- `src/pages/Checkout.jsx`: estructura de `checkout.html` (datos comprador, dirección, pago, resumen con miniaturas). Conserva autenticación y operaciones de `carritoApi.sincronizar` y `pedidosApi.crear` mediante Gateway.
- El backend es quien determina el costo final de despacho. El resumen en React indica **subtotal** y no afirma envío gratis sin confirmación del servidor.
- El checkout no captura información bancaria real (PAN/CVV). Se conserva el selector de métodos que entiende ServicePago y se explica que es una simulación. Los campos visuales de tarjeta del HTML original se sustituyeron deliberadamente.

## Imágenes
- Nuevo `src/components/ImagenProducto.jsx` con imagen de respaldo si falla una URL.
- La función `rutaImagen` reconoce rutas recibidas del backend que incluyen `img/` o `public/img/`, incluso cuando vienen con separadores Windows, codificando correctamente espacios y caracteres.
- Se aplican reglas `object-fit: contain` y tamaños restringidos a las miniaturas y recomendaciones, sin estirar ni apilar imágenes.
- Se comprobó la existencia de los 15 archivos de imágenes originales en `public/img/productos/`; sus bytes no se alteraron. Algunos JPG/PNG originales **contienen fondo blanco incorporado en el propio archivo** (por ejemplo `Transcend 512 GB/2334322.png`); CSS no puede quitar de forma limpia esos píxeles. Si se necesita transparencia real debe proveerse o editarse ese recurso concreto.

## Compatibilidad y comprobación
- `npm run check`: 0 errores de referencias (31 imágenes disponibles).
- Transpilación/parseo Babel de 45 archivos JS/JSX: correcta.
- `npm run build`: no se pudo completar en el entorno de preparación, debido a un binario nativo de Rolldown ausente. En Windows, instalar dependencias desde cero y ejecutar `npm run build`.
- No se realizó una prueba E2E contra tus servicios MySQL/Spring activos: debe comprobarse en tu equipo.

## Ejecutar en Windows
```powershell
npm install
npm run check
npm run dev
```
Usa `http://localhost:5173`, con MySQL y los microservicios levantados. `.env` sigue apuntando a `http://localhost:8090` y `VITE_USE_MOCK=false`.
