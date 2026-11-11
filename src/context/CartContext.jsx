import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { agregarItem, cambiarCantidadItem, normalizarCarrito, quitarItem } from "../utils/cart";

const CLAVE = "fullcomponents-carrito-v2";
const CartContext = createContext(null);

function leer() {
  try { return normalizarCarrito(JSON.parse(localStorage.getItem(CLAVE))); } catch { return []; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(leer);

  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify(items)); } catch { /* sin storage */ }
  }, [items]);

  const valor = useMemo(
    () => ({
      items,
      cantidadTotal: items.reduce((s, i) => s + i.cantidad, 0),
      agregar: (producto) => setItems((c) => agregarItem(c, producto)),
      cambiarCantidad: (producto, cambio) => setItems((c) => cambiarCantidadItem(c, producto, cambio)),
      quitar: (id) => setItems((c) => quitarItem(c, id)),
      vaciar: () => setItems([]),
    }),
    [items]
  );

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
};
