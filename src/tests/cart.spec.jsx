import { agregarItem, calcularTotal, cambiarCantidadItem, normalizarCarrito, quitarItem } from "../utils/cart";

describe("lógica del carrito", () => {
  const p = { id: 1, precio: 1000, stock: 2 };

  it("agrega un producto nuevo con cantidad 1", () => expect(agregarItem([], p)).toEqual([{ id: 1, cantidad: 1 }]));
  it("no supera el stock", () => {
    const lleno = [{ id: 1, cantidad: 2 }];
    expect(agregarItem(lleno, p)).toBe(lleno);
  });
  it("no agrega productos sin stock", () => expect(agregarItem([], { ...p, stock: 0 })).toEqual([]));
  it("suma y resta cantidades; al llegar a 0 elimina la línea", () => {
    const c1 = cambiarCantidadItem([{ id: 1, cantidad: 1 }], p, 1);
    expect(c1[0].cantidad).toBe(2);
    expect(cambiarCantidadItem(c1, p, -2)).toEqual([]);
  });
  it("quita ítems y calcula el total", () => {
    expect(quitarItem([{ id: 1, cantidad: 1 }, { id: 2, cantidad: 1 }], 1)).toEqual([{ id: 2, cantidad: 1 }]);
    expect(calcularTotal([{ id: 1, cantidad: 3 }], [p])).toBe(3000);
  });
  it("normaliza datos corruptos de localStorage", () => {
    expect(normalizarCarrito("basura")).toEqual([]);
    expect(normalizarCarrito([{ id: "1", cantidad: "2" }, { id: 2, cantidad: 0 }])).toEqual([{ id: 1, cantidad: 2 }]);
  });
});
