import { Link } from "react-router-dom";
import Estado from "../components/Estado";
import ImagenProducto from "../components/ImagenProducto";
import useProductos from "../hooks/useProductos";
import { useCart } from "../context/CartContext";
import { calcularTotal } from "../utils/cart";
import { formatearPrecio } from "../utils/format";

export default function Carrito() {
  const { items, cambiarCantidad, quitar, vaciar, agregar } = useCart();
  const { productos, cargando, error, recargar } = useProductos();
  if (cargando || error) return <main className="pagina-carrito"><div className="container"><Estado cargando={cargando} error={error} onReintentar={recargar}/></div></main>;

  const lineas = items.map(i => ({ ...i, producto: productos.find(p => Number(p.id) === i.id) })).filter(l => l.producto);
  const total = calcularTotal(items, productos);
  const unidades = lineas.reduce((n, item) => n + item.cantidad, 0);
  const recomendaciones = [15, 13, 3].map(id => productos.find(p => Number(p.id) === id)).filter(p => p && !items.some(i => i.id === Number(p.id))).slice(0, 3);
  const alternativas = recomendaciones.length ? recomendaciones : productos.filter(p => !items.some(i => i.id === Number(p.id))).slice(0, 3);

  return <main className="pagina-carrito">
    <div className="container">
      <nav aria-label="Ruta de navegación"><ol className="breadcrumb carrito-breadcrumb"><li className="breadcrumb-item"><Link to="/">Inicio</Link></li><li className="breadcrumb-item active" aria-current="page">Carrito de compras</li></ol></nav>
      <div className="carrito-encabezado"><div><h1>Tu carrito</h1><p>Revisa tus productos y finaliza tu compra.</p></div><Link to="/catalogo" className="seguir-comprando">← Seguir comprando</Link></div>
      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-8">
          <section className="carrito-productos" aria-labelledby="titulo-listado">
            <h2 id="titulo-listado" className="visually-hidden">Productos agregados al carrito</h2>
            {lineas.length ? <>
              <div className="carrito-columnas"><span>Producto</span><span>Precio unitario</span><span>Cantidad</span><span>Subtotal</span></div>
              {lineas.map(({ producto: p, cantidad }) => <article className="carrito-item" key={p.id}>
                <div className="carrito-producto-info"><Link to={`/producto/${p.id}`} className="carrito-foto"><ImagenProducto src={p.imagen} alt={p.nombre}/></Link><div><h3><Link to={`/producto/${p.id}`} className="carrito-nombre-enlace">{p.nombre}</Link></h3><p>{p.categoria} | {p.marca}</p><span className={p.stock - cantidad > 0 ? "carrito-stock" : "text-muted small"}>Disponible para añadir: {Math.max(0, p.stock - cantidad)}</span></div></div>
                <div className="carrito-precio" data-label="Precio unitario">{formatearPrecio(p.precio)}</div>
                <div className="control-cantidad" role="group" aria-label={`Cantidad de ${p.nombre}`}><button type="button" onClick={() => cambiarCantidad(p, -1)} aria-label={`Quitar una unidad de ${p.nombre}`}>−</button><span aria-live="polite">{cantidad}</span><button type="button" onClick={() => cambiarCantidad(p, 1)} disabled={cantidad >= p.stock} aria-label={`Agregar una unidad de ${p.nombre}`}>+</button></div>
                <div className="carrito-subtotal-contenedor"><span className="carrito-subtotal">{formatearPrecio(p.precio * cantidad)}</span><button type="button" className="btn-eliminar" aria-label={`Eliminar ${p.nombre} del carrito`} title="Eliminar del carrito" onClick={() => quitar(p.id)}>🗑</button></div>
              </article>)}
              <div className="carrito-acciones"><button type="button" className="btn btn-vaciar" onClick={vaciar}>🗑 Vaciar carrito</button><Link to="/catalogo">Seguir comprando →</Link></div>
            </> : <div className="carrito-vacio"><span aria-hidden="true">🛒</span><h3>Tu carrito está vacío</h3><p>Todavía no has agregado productos. Explora nuestro catálogo y encuentra los componentes que necesitas.</p><Link to="/catalogo" className="btn btn-carrito-principal">Explorar productos</Link></div>}
          </section>
          <section className="carrito-recomendaciones" aria-labelledby="titulo-recomendaciones"><div className="recomendaciones-encabezado"><h2 id="titulo-recomendaciones">También te puede interesar</h2><Link to="/catalogo">Ver más productos →</Link></div>
            <div className="row g-3">{alternativas.map(p => <div className="col-12 col-md-4" key={p.id}><article className="recomendacion"><Link to={`/producto/${p.id}`}><ImagenProducto src={p.imagen} alt={p.nombre}/></Link><div className="recomendacion-contenido"><h3>{p.nombre}</h3><p>{formatearPrecio(p.precio)}</p><button type="button" className="btn btn-recomendacion" disabled={p.stock <= 0} onClick={() => agregar(p)}>Agregar al carrito</button></div></article></div>)}</div>
          </section>
        </div>
        <div className="col-12 col-lg-4"><aside className="resumen-compra"><h2>Resumen de compra</h2><div className="resumen-linea"><span>Subtotal ({unidades} {unidades === 1 ? "producto" : "productos"})</span><span>{formatearPrecio(total)}</span></div><div className="resumen-linea"><span>Envío</span><span className="resumen-envio">Calculado en el siguiente paso</span></div><hr/><div className="resumen-total"><span>Total</span><strong>{formatearPrecio(total)}</strong></div><p className="resumen-impuesto">IVA incluido</p><Link to={lineas.length ? "/checkout" : "/catalogo"} className="btn btn-carrito-principal w-100">{lineas.length ? "Finalizar compra" : "Explorar productos"}</Link><div className="compra-segura"><span aria-hidden="true">🛡️</span><div><strong>Compra 100% segura</strong><p>Tus datos están protegidos durante el proceso de compra.</p></div></div></aside></div>
      </div>
    </div>
  </main>;
}
