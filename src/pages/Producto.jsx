import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productosApi } from "../api";
import Estado from "../components/Estado";
import useAsync from "../hooks/useAsync";
import { useCart } from "../context/CartContext";
import { formatearPrecio } from "../utils/format";
import ImagenProducto from "../components/ImagenProducto";

export default function Producto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, agregar } = useCart();
  const [mensaje, setMensaje] = useState("");
  const [imagenActiva, setImagenActiva] = useState(0);
  const { datos: p, cargando, error, recargar } = useAsync(() => productosApi.obtener(id), [id]);

  if (cargando || error) return <main className="container py-4"><Estado cargando={cargando} error={error} onReintentar={recargar} /></main>;
  if (!p) return <main className="container py-4"><div className="alert alert-warning">Producto no encontrado. <Link to="/catalogo">Volver al catálogo</Link></div></main>;

  const enCarrito = items.find((i) => i.id === Number(p.id))?.cantidad ?? 0;
  const restante = p.stock - enCarrito;

  const añadir = () => {
    agregar(p);
    setMensaje(`${p.nombre} se agregó al carrito.`);
  };

  return (
    <main className="container py-4">
      <nav aria-label="breadcrumb"><ol className="breadcrumb">
        <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
        <li className="breadcrumb-item"><Link to={`/catalogo?categoria=${encodeURIComponent(p.categoria)}`}>{p.categoria}</Link></li>
        <li className="breadcrumb-item active">{p.nombre}</li>
      </ol></nav>

      {mensaje && <div className="alert alert-success" role="status">{mensaje}</div>}

      <div className="row g-4">
        <div className="col-md-6">
          <ImagenProducto src={(p.imagenes ?? [p.imagen])[imagenActiva] ?? p.imagen} alt={p.nombre} className="imagen-detalle" />
          {(p.imagenes?.length ?? 0) > 1 && <div className="d-flex gap-2 mt-3 flex-wrap" aria-label="Galería de imágenes">{p.imagenes.map((src,index) => <button type="button" key={`${src}-${index}`} className={`btn p-1 ${index===imagenActiva?"border-primary border-2":"border"}`} onClick={() => setImagenActiva(index)} aria-label={`Ver imagen ${index+1}`}><ImagenProducto src={src} alt="" style={{height:64,width:72,objectFit:"contain"}}/></button>)}</div>}
        </div>
        <div className="col-md-6">
          <span className="producto-categoria">{p.categoria}</span>
          <h1 className="h3">{p.nombre}</h1>
          <p className="text-muted">Marca: {p.marca} · Modelo: {p.modelo}</p>
          <p className="h2">{formatearPrecio(p.precio)}</p>
          <p>{p.descripcion}</p>
          <p className={restante > 0 ? "text-success" : "text-danger"}>{restante > 0 ? `${restante} unidad(es) disponibles` : "Sin stock disponible"}</p>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" disabled={restante <= 0} onClick={() => { agregar(p); navigate("/carrito"); }}>Comprar ahora</button>
            <button className="btn btn-outline-primary" disabled={restante <= 0} onClick={añadir}>Agregar al carrito</button>
          </div>
        </div>
      </div>

      <section className="mt-5">
        <h2 className="h5">Especificaciones</h2>
        <div className="table-responsive">
          <table className="table table-striped"><tbody>
            {Object.entries(p.especificaciones ?? {}).map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}
          </tbody></table>
        </div>
      </section>
      {(p.garantia?.periodoMeses != null || p.garantia?.condicionesGarantia) && <section className="mt-4"><h2 className="h5">Garantía</h2><p>{p.garantia.periodoMeses != null ? `${p.garantia.periodoMeses} meses. ` : ""}{p.garantia.condicionesGarantia}</p></section>}
      {(p.informacionDespacho?.condicionesDespacho || p.informacionDespacho?.plazoReferencial) && <section className="mt-4"><h2 className="h5">Información de despacho</h2><p>{p.informacionDespacho.condicionesDespacho} {p.informacionDespacho.plazoReferencial}</p></section>}
      {p.relacionados?.length > 0 && <section className="mt-4"><h2 className="h5">Productos relacionados</h2><div className="row g-3">{p.relacionados.map(r => <div className="col-md-4" key={r.id}><Link className="card card-body h-100 text-decoration-none" to={`/producto/${r.id}`}>{r.nombre} — {formatearPrecio(r.precio)}</Link></div>)}</div></section>}
    </main>
  );
}
