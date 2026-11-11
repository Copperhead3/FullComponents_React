import { Link } from "react-router-dom";
import { formatearPrecio } from "../utils/format";
import ImagenProducto from "./ImagenProducto";

export default function ProductCard({ producto }) {
  return (
    <article className="tarjeta-producto">
      <Link to={`/producto/${producto.id}`} className="producto-imagen">
        <ImagenProducto src={producto.imagen} alt={producto.nombre} loading="lazy" />
      </Link>
      <div className="producto-info">
        <span className="producto-categoria">{producto.categoria}</span>
        <h3 className="producto-nombre">{producto.nombre}</h3>
        <p className="producto-marca">Marca: {producto.marca}</p>
        <p className="producto-precio">{formatearPrecio(producto.precio)}</p>
        <Link to={`/producto/${producto.id}`} className="btn btn-producto">Ver producto</Link>
      </div>
    </article>
  );
}
