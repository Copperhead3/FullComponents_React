import { useEffect, useState } from "react";
import { rutaImagen } from "../utils/format";

/** Las rutas almacenadas en MySQL apuntan a los archivos públicos del frontend. */
export default function ImagenProducto({ src, alt = "", className = "", ...resto }) {
  const url = rutaImagen(src);
  const [actual, setActual] = useState(url);
  useEffect(() => setActual(url), [url]);
  return <img {...resto} src={actual} alt={alt} className={className} onError={() => {
    if (actual !== "/img/sin-imagen.svg") setActual("/img/sin-imagen.svg");
  }} />;
}
