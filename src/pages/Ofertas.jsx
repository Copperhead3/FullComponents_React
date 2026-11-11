import { Link } from "react-router-dom";
import Estado from "../components/Estado";
import ProductCard from "../components/ProductCard";
import useProductos from "../hooks/useProductos";

// El backend no incluye un contrato de promociones/descuentos. No inventamos porcentajes.
export default function Ofertas() {
  const { productos, cargando, error, recargar } = useProductos();
  const seleccion = productos.filter(p => /kingston|corsair|msi/i.test(`${p.marca} ${p.nombre}`));
  return <main className="container py-4"><h1 className="h2 mb-2">Productos seleccionados</h1>
    <p className="text-muted">Revisa los precios y la disponibilidad actualizados desde nuestro catálogo.</p>
    <Estado cargando={cargando} error={error} onReintentar={recargar} />
    <div className="row g-4 row-cols-2 row-cols-md-3 row-cols-lg-4">{seleccion.map(p => <div key={p.id} className="col"><ProductCard producto={p}/></div>)}</div>
    <Link to="/catalogo" className="btn btn-outline-primary mt-4">Ver catálogo completo</Link>
  </main>;
}
