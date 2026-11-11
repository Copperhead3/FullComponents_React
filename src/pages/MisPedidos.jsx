import { Link } from "react-router-dom";
import { pedidosApi } from "../api";
import Estado from "../components/Estado";
import useAsync from "../hooks/useAsync";
import { useAuth } from "../context/AuthContext";
import { formatearPrecio } from "../utils/format";

export default function MisPedidos() {
  const { usuario } = useAuth();
  const { datos, cargando, error, recargar } = useAsync(() => (usuario ? pedidosApi.porCliente(usuario.id) : Promise.resolve([])), [usuario?.id]);

  if (!usuario) return <main className="container py-5 text-center"><p>Inicia sesión para ver tus pedidos.</p><Link to="/login" className="btn btn-primary">Iniciar sesión</Link></main>;

  return (
    <main className="container py-4">
      <h1 className="h2 mb-4">Mis pedidos</h1>
      <Estado cargando={cargando} error={error} onReintentar={recargar} />
      {datos && datos.length === 0 && <div className="alert alert-info">Aún no tienes pedidos.</div>}
      {datos?.map((p) => (
        <div className="card mb-3" key={p.id}><div className="card-body">
          <div className="d-flex justify-content-between flex-wrap">
            <strong>Pedido N° {p.id}</strong>
            <span className="badge bg-primary">{p.estado.replace("_", " ")}</span>
          </div>
          <div className="text-muted small mb-2">{p.fecha ? new Date(p.fecha).toLocaleString("es-CL") : ""}</div>
          <ul className="mb-2">{p.detalles.map((d) => <li key={d.idProducto}>{d.cantidad} × {d.nombre} — {formatearPrecio(d.subtotal)}</li>)}</ul>
          <div>Despacho: {formatearPrecio(p.costoDespacho)} · <strong>Total: {formatearPrecio(p.total)}</strong></div>
        </div></div>
      ))}
    </main>
  );
}
