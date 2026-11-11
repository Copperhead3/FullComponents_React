import { useEffect, useState } from "react";

// Carrusel propio (el de Bootstrap JS no se auto-inicializa en una SPA de React).
export default function Banner({ imagenes, intervalo = 5000 }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (imagenes.length < 2) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % imagenes.length), intervalo);
    return () => clearInterval(t);
  }, [imagenes.length, intervalo]);

  return (
    <div id="carouselPrincipal" className="carousel slide" aria-label="Promociones destacadas">
      <div className="carousel-indicators">
        {imagenes.map((_, n) => (
          <button key={n} type="button" className={n === i ? "active" : ""} aria-label={`Banner ${n + 1}`} onClick={() => setI(n)} />
        ))}
      </div>
      <div className="carousel-inner">
        {imagenes.map((src, n) => (
          <div key={src} className={`carousel-item ${n === i ? "active" : ""}`}>
            <img src={src} className="d-block w-100" alt={`Promoción ${n + 1}`} />
          </div>
        ))}
      </div>
      <button type="button" className="carousel-control-prev" aria-label="Promoción anterior" onClick={() => setI((i + imagenes.length - 1) % imagenes.length)}><span className="carousel-control-prev-icon" aria-hidden="true" /></button>
      <button type="button" className="carousel-control-next" aria-label="Promoción siguiente" onClick={() => setI((i + 1) % imagenes.length)}><span className="carousel-control-next-icon" aria-hidden="true" /></button>
    </div>
  );
}
