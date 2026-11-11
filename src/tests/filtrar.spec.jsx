import { filtrarProductos } from "../utils/filtrarProductos";

describe("filtrarProductos", () => {
  const lista = [
    { id: 1, nombre: "Intel i5", marca: "Intel", modelo: "X", categoria: "Procesadores", precio: 200 },
    { id: 2, nombre: "Kingston Fury", marca: "Kingston", modelo: "Y", categoria: "Memorias RAM", precio: 100 },
    { id: 3, nombre: "ASUS RX", marca: "ASUS", modelo: "Z", categoria: "Tarjetas gráficas", precio: 500 },
  ];
  it("busca por texto en nombre, marca o modelo", () => expect(filtrarProductos(lista, { texto: "kingston" }).map((p) => p.id)).toEqual([2]));
  it("filtra por categoría y rango de precio", () => {
    expect(filtrarProductos(lista, { categoria: "Procesadores" }).length).toBe(1);
    expect(filtrarProductos(lista, { min: "150", max: "600" }).map((p) => p.id)).toEqual([1, 3]);
  });
  it("ordena sin mutar la lista original", () => {
    expect(filtrarProductos(lista, { orden: "precio-asc" }).map((p) => p.id)).toEqual([2, 1, 3]);
    expect(lista[0].id).toBe(1);
  });
});
