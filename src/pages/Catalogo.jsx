import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Estado from "../components/Estado";
import useProductos from "../hooks/useProductos";
import { filtrarProductos } from "../utils/filtrarProductos";

// Los filtros viven en la URL (?q=&categoria=&min=&max=&orden=): se pueden compartir y funcionan con "atrás".
export default function Catalogo() {
  const [params, setParams] = useSearchParams();
  const { productos, cargando, error, recargar } = useProductos();

  const filtros = {
    texto: params.get("q") ?? "",
    categoria: params.get("categoria") ?? "",
    min: params.get("min") ?? "",
    max: params.get("max") ?? "",
    orden: params.get("orden") ?? "relevancia",
  };

  const cambiar = (clave, valor) => {
    const siguiente = new URLSearchParams(params);
    valor ? siguiente.set(clave, valor) : siguiente.delete(clave);
    setParams(siguiente, { replace: true });
  };

  const categorias = useMemo(() => [...new Set(productos.map((p) => p.categoria))], [productos]);
  const resultados = useMemo(() => filtrarProductos(productos, filtros), [productos, params]); // eslint-disable-line

  return (
    <main className="container py-4">
      <h1 className="h2 mb-4">Catálogo de productos</h1>
      <div className="row">
        <aside className="col-lg-3 mb-4">
          <div className="p-3 border rounded">
            <h2 className="h5">Filtrar productos</h2>
            <label className="form-label mt-2" htmlFor="filtroCategoria">Categoría</label>
            <select id="filtroCategoria" className="form-select" value={filtros.categoria} onChange={(e) => cambiar("categoria", e.target.value)}>
              <option value="">Todas</option>
              {categorias.map((c) => <option key={c}>{c}</option>)}
            </select>
            <label className="form-label mt-2" htmlFor="precioMinimo">Precio mínimo</label>
            <input id="precioMinimo" type="number" min="0" className="form-control" value={filtros.min} onChange={(e) => cambiar("min", e.target.value)} />
            <label className="form-label mt-2" htmlFor="precioMaximo">Precio máximo</label>
            <input id="precioMaximo" type="number" min="0" className="form-control" value={filtros.max} onChange={(e) => cambiar("max", e.target.value)} />
            <button className="btn btn-outline-secondary w-100 mt-3" onClick={() => setParams({}, { replace: true })}>Limpiar filtros</button>
          </div>
        </aside>

        <section className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span id="cantidadResultados">{resultados.length} producto(s)</span>
            <select className="form-select w-auto" aria-label="Ordenar" value={filtros.orden} onChange={(e) => cambiar("orden", e.target.value)}>
              <option value="relevancia">Relevancia</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre</option>
            </select>
          </div>
          <Estado cargando={cargando} error={error} onReintentar={recargar} />
          {!cargando && !error && resultados.length === 0 && <div className="alert alert-info">No encontramos productos con esos filtros.</div>}
          <div className="row g-4 row-cols-2 row-cols-md-3">
            {resultados.map((p) => <div className="col" key={p.id}><ProductCard producto={p} /></div>)}
          </div>
        </section>
      </div>
    </main>
  );
}
