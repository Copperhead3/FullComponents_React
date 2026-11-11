import { useState } from "react";
import { pedidosApi, usuariosApi } from "../../api";
import Estado from "../../components/Estado";
import useAsync from "../../hooks/useAsync";
import { formatearPrecio } from "../../utils/format";

// Valores de EstadoPedido del backend. El servidor valida las transiciones permitidas y devuelve el motivo si no se puede.
const ESTADOS = ["PENDIENTE", "CONFIRMADO", "EN_PREPARACION", "ENVIADO", "ENTREGADO", "CANCELADO"];
const etiqueta = (s) => s.replace("_", " ");

export default function PedidosAdmin() {
  const { datos, cargando, error, recargar } = useAsync(async () => {
    const [pedidos, clientes] = await Promise.all([pedidosApi.listar(), usuariosApi.listarClientes()]);
    return { pedidos, nombres: new Map(clientes.map((c) => [c.id, c.nombre])) };
  }, []);
  const [detalle, setDetalle] = useState(null);
  const [aviso, setAviso] = useState("");

  const cambiarEstado = async (id, estado) => {
    try {
      const actualizado = await pedidosApi.cambiarEstado(id, estado);
      setAviso("");
      setDetalle((d) => (d && d.id === id ? { ...d, estado: actualizado?.estado ?? estado } : d));
    } catch (e) { setAviso(e.message); }
    recargar(); // refresca también si el servidor rechazó el cambio (vuelve al estado real)
  };

  const nombre = (p) => datos.nombres.get(p.idCliente) ?? `Cliente #${p.idCliente}`;

  return (
    <>
      <h1 className="h3 mb-3">Pedidos</h1>
      {aviso && <div className="alert alert-danger" role="alert">{aviso}</div>}
      <Estado cargando={cargando} error={error} onReintentar={recargar} />
      {datos && datos.pedidos.length === 0 && <div className="alert alert-info">Aún no hay pedidos.</div>}
      {datos && datos.pedidos.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead><tr><th>N°</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th><th /></tr></thead>
            <tbody>
              {datos.pedidos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td><td>{p.fecha ? new Date(p.fecha).toLocaleString("es-CL") : ""}</td><td>{nombre(p)}</td><td>{formatearPrecio(p.total)}</td>
                  <td>
                    <select className="form-select form-select-sm" value={p.estado} aria-label={`Estado del pedido ${p.id}`} onChange={(e) => cambiarEstado(p.id, e.target.value)}>
                      {ESTADOS.map((s) => <option key={s} value={s}>{etiqueta(s)}</option>)}
                    </select>
                  </td>
                  <td><button className="btn btn-sm btn-outline-primary" onClick={() => setDetalle(p)}>Ver</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {detalle && (
        <div className="card mt-4"><div className="card-body">
          <div className="d-flex justify-content-between"><h2 className="h5">Pedido {detalle.id}</h2><button className="btn-close" aria-label="Cerrar" onClick={() => setDetalle(null)} /></div>
          <p className="mb-1"><strong>Cliente:</strong> {nombre(detalle)}</p>
          <p className="mb-1"><strong>Estado:</strong> {etiqueta(detalle.estado)} · <strong>Pago N°</strong> {detalle.idPago ?? "—"} · <strong>Despacho N°</strong> {detalle.idDespacho ?? "—"}</p>
          <ul>{detalle.detalles.map((i) => <li key={i.idProducto}>{i.cantidad} × {i.nombre} — {formatearPrecio(i.subtotal)}</li>)}</ul>
          <p className="mb-0">Subtotal {formatearPrecio(detalle.subtotal)} + despacho {formatearPrecio(detalle.costoDespacho)} = <strong>{formatearPrecio(detalle.total)}</strong></p>
        </div></div>
      )}
    </>
  );
}
