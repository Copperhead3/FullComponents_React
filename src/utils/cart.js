// Reglas del carrito como funciones puras (inmutables) para poder probarlas.
export function normalizarCarrito(datos) {
  if (!Array.isArray(datos)) return [];
  return datos
    .filter((i) => Number.isInteger(Number(i.id)) && Number.isInteger(Number(i.cantidad)) && Number(i.cantidad) > 0)
    .map((i) => ({ id: Number(i.id), cantidad: Number(i.cantidad) }));
}

export function agregarItem(carrito, producto) {
  if (!producto || !Number.isInteger(producto.stock) || producto.stock <= 0) return carrito;
  const existente = carrito.find((i) => i.id === Number(producto.id));
  if (!existente) return [...carrito, { id: Number(producto.id), cantidad: 1 }];
  if (existente.cantidad >= producto.stock) return carrito;
  return carrito.map((i) => (i === existente ? { ...i, cantidad: i.cantidad + 1 } : i));
}

export function cambiarCantidadItem(carrito, producto, cambio) {
  const item = carrito.find((i) => i.id === Number(producto.id));
  if (!item) return carrito;
  const nueva = item.cantidad + cambio;
  if (nueva > producto.stock) return carrito;
  if (nueva <= 0) return carrito.filter((i) => i !== item);
  return carrito.map((i) => (i === item ? { ...i, cantidad: nueva } : i));
}

export const quitarItem = (carrito, id) => carrito.filter((i) => i.id !== Number(id));

export function calcularTotal(carrito, productos) {
  return carrito.reduce((suma, i) => {
    const p = productos.find((x) => Number(x.id) === i.id);
    return suma + (p ? p.precio * i.cantidad : 0);
  }, 0);
}
