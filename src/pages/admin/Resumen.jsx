import { pedidosApi, usuariosApi } from "../../api";
import Estado from "../../components/Estado";
import useAsync from "../../hooks/useAsync";
import useProductos from "../../hooks/useProductos";
import { formatearPrecio } from "../../utils/format";

export default function Resumen() {
  const prod = useProductos({ admin: true });
  const { datos, cargando, error, recargar } = useAsync(async () => {
    const [pedidos, clientes] = await Promise.all([pedidosApi.listar(), usuariosApi.listarClientes()]);
    return { pedidos, clientes };
  }, []);

  if (cargando || prod.cargando || error || prod.error) return <Estado cargando={cargando || prod.cargando} error={error || prod.error} onReintentar={() => { recargar(); prod.recargar(); }} />;
  const { pedidos, clientes } = datos;
  const ventas = pedidos.filter((p) => p.estado !== "CANCELADO").reduce((s, p) => s + p.total, 0);
  const bajoStock = prod.productos.filter((p) => p.stock <= Math.max(p.stockMinimo, 2));

  const tarjeta = (titulo, valor) => (
    <div className="col-6 col-lg-3"><div className="card text-center"><div className="card-body"><div className="text-muted">{titulo}</div><div className="h3">{valor}</div></div></div></div>
  );

  return (
    <>
      <h1 className="h3 mb-4">Resumen</h1>
      <div className="row g-3 mb-4">
        {tarjeta("Productos", prod.productos.length)}{tarjeta("Pedidos", pedidos.length)}
        {tarjeta("Clientes", clientes.length)}{tarjeta("Ventas (sin cancelados)", formatearPrecio(ventas))}
      </div>
      <h2 className="h5">Stock bajo</h2>
      {bajoStock.length ? <ul>{bajoStock.map((p) => <li key={p.id}>{p.nombre}: {p.stock} disponible(s)</li>)}</ul> : <p className="text-muted">Sin alertas de stock.</p>}
    </>
  );
}
