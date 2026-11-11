// Lógica pura del catálogo: filtros, búsqueda y orden (fácil de probar).
export function filtrarProductos(productos, { texto = "", categoria = "", min = "", max = "", orden = "relevancia" } = {}) {
  const t = texto.trim().toLowerCase();
  let lista = productos.filter((p) => {
    if (categoria && p.categoria !== categoria) return false;
    if (min !== "" && p.precio < Number(min)) return false;
    if (max !== "" && p.precio > Number(max)) return false;
    if (t && !`${p.nombre} ${p.marca} ${p.modelo}`.toLowerCase().includes(t)) return false;
    return true;
  });

  const ordenes = {
    "precio-asc": (a, b) => a.precio - b.precio,
    "precio-desc": (a, b) => b.precio - a.precio,
    nombre: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
  };
  if (ordenes[orden]) lista = [...lista].sort(ordenes[orden]);
  return lista;
}
