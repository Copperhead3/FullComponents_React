export function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(Number(precio) || 0);
}

// Las URL de ServiceProducto pueden contener espacios, caracteres acentuados o rutas de Windows.
// Se codifican segmentos una sola vez, manteniendo una URL externa tal como la envía el servidor.
export function rutaImagen(imagen) {
  if (!imagen) return "/img/sin-imagen.svg";
  const s = String(imagen).replace(/\\/g, "/").trim();
  if (/^(https?:|data:|blob:)/i.test(s)) return s;
  // URLs guardadas por Spring pueden llevar public/, /img/, o incluir la ruta completa
  // del proyecto Windows; en todos esos casos las imágenes viven en Vite /public/img.
  const deImg = s.match(/(?:^|\/)img\/(.+)$/i);
  const limpia = deImg ? `img/${deImg[1]}` : s.replace(/^\/?(?:public\/)?/, "");
  return "/" + limpia.split("/").map((parte) => {
    try { return encodeURIComponent(decodeURIComponent(parte)); } catch { return encodeURIComponent(parte); }
  }).join("/");
}
