import { useState } from "react";
import { productosApi } from "../../api";
import Estado from "../../components/Estado";
import ProductoForm from "../../components/ProductoForm";
import useCategorias from "../../hooks/useCategorias";
import useProductos from "../../hooks/useProductos";
import { formatearPrecio } from "../../utils/format";

const COLOR = { PUBLICADO: "success", BORRADOR: "secondary", DESPUBLICADO: "warning" };

export default function ProductosAdmin() {
  const { productos, cargando, error, recargar } = useProductos({ admin: true });
  const { categorias } = useCategorias();
  const [editando, setEditando] = useState(null); // null = cerrado, {} = nuevo, producto = edición
  const [aviso, setAviso] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const ejecutar = async (accion, ok) => {
    try { await accion(); setAviso({ tipo: "success", texto: ok }); setEditando(null); recargar(); }
    catch (e) { setAviso({ tipo: "danger", texto: e.message }); }
  };

  const guardar = (datos) =>
    editando?.id
      ? ejecutar(() => productosApi.actualizar(editando.id, datos), "Producto actualizado.")
      : ejecutar(() => productosApi.crear(datos), "Producto creado.");

  const eliminar = (p) => window.confirm(`¿Eliminar "${p.nombre}"?`) && ejecutar(() => productosApi.eliminar(p.id), "Producto eliminado.");

  const lista = productos.filter((p) => `${p.nombre} ${p.marca} ${p.categoria}`.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Productos</h1>
        <button className="btn btn-primary" onClick={() => setEditando({})}>+ Nuevo producto</button>
      </div>
      {aviso && <div className={`alert alert-${aviso.tipo}`} role="status">{aviso.texto}</div>}
      <Estado cargando={cargando} error={error} onReintentar={recargar} />

      {editando && (
        <div className="card mb-4"><div className="card-body">
          <h2 className="h5">{editando.id ? "Editar producto" : "Nuevo producto"}</h2>
          <ProductoForm key={editando.id ?? "nuevo"} inicial={editando} categorias={categorias} onGuardar={guardar} onCancelar={() => setEditando(null)} />
        </div></div>
      )}

      <input className="form-control mb-3" placeholder="Buscar en la tabla..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead><tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock disp.</th><th>Estado</th><th /></tr></thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td><td>{p.nombre}</td><td>{p.categoria}</td><td>{formatearPrecio(p.precio)}</td><td>{p.stock}</td>
                <td><span className={`badge bg-${COLOR[p.estado] ?? "secondary"}`}>{p.estado}</span></td>
                <td className="text-end text-nowrap">
                  <button className="btn btn-sm btn-warning me-2" onClick={() => setEditando(p)}>Editar</button>
                  <button className="btn btn-sm btn-danger" onClick={() => eliminar(p)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
