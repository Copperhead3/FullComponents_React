import { aCategoria, aPedido, aProducto, deProducto, rutParaBackend } from "../api/adapters";

const rawProducto = {
  idProducto: 4, nombreProducto: "ASUS RX 7600", marca: "ASUS", modelo: "Dual", descripcion: "GPU", precioVigente: 318870.0, estado: "PUBLICADO",
  categoria: { idCategoria: 2, nombreCategoria: "Tarjetas gráficas" },
  imagenes: [
    { url: "img/b.png", formato: "png", orden: 1, esPrincipal: false },
    { url: "img/a.webp", formato: "webp", orden: 0, esPrincipal: true },
  ],
  especificaciones: [{ valor: "8", definicionAtributo: { idDefinicionAtributo: 9, nombreAtributo: "Memoria", unidad: "GB" } }],
};

describe("adapters (backend <-> front)", () => {
  it("aProducto traduce nombres, elige la imagen principal y calcula el stock disponible", () => {
    const p = aProducto(rawProducto, { idStock: 3, cantidadFisica: 10, cantidadReservada: 4, stockMinimo: 2 });
    expect(p.id).toBe(4);
    expect(p.nombre).toBe("ASUS RX 7600");
    expect(p.precio).toBe(318870);
    expect(p.categoria).toBe("Tarjetas gráficas");
    expect(p.imagen).toBe("img/a.webp");
    expect(p.stock).toBe(6);
    expect(p.stockFisico).toBe(10);
    expect(p.especificaciones["Memoria (GB)"]).toBe("8");
  });
  it("aProducto sin registro de stock deja stock 0", () => expect(aProducto(rawProducto, null).stock).toBe(0));
  it("deProducto arma el cuerpo que espera Spring (categoría anidada, imagen y especificaciones)", () => {
    const body = deProducto({ nombre: "X", marca: "M", modelo: "Y", descripcion: "D", precio: 10, categoriaId: 2, imagen: "img/x.png", estado: "PUBLICADO",
      atributos: [{ idDefinicionAtributo: 9, valor: " 8 " }, { idDefinicionAtributo: 10, valor: "" }] });
    expect(body.nombreProducto).toBe("X");
    expect(body.precioVigente).toBe(10);
    expect(body.categoria).toEqual({ idCategoria: 2 });
    expect(body.imagenes).toEqual([{ url: "img/x.png", formato: "png", orden: 0, esPrincipal: true }]);
    expect(body.especificaciones).toEqual([{ valor: "8", definicionAtributo: { idDefinicionAtributo: 9 } }]);
  });
  it("aCategoria acepta ambos nombres de la lista de atributos", () => {
    expect(aCategoria({ idCategoria: 1, nombreCategoria: "RAM", definicionesAtributos: [{ idDefinicionAtributo: 5, nombreDefinicionAtributo: "Capacidad" }] }).atributos[0].nombre).toBe("Capacidad");
  });
  it("aPedido convierte importes y detalles", () => {
    const p = aPedido({ idPedido: 1, idCliente: 2, estado: "CONFIRMADO", subtotal: "100.00", costoDespacho: "5990.00", total: "6090.00",
      detalles: [{ idProducto: 4, nombreProducto: "GPU", cantidad: 1, precioUnitario: "100.00", subtotal: "100.00" }] });
    expect(p.total).toBe(6090);
    expect(p.detalles[0].nombre).toBe("GPU");
  });
  it("rutParaBackend quita puntos y agrega guion", () => {
    expect(rutParaBackend("12.345.678-5")).toBe("12345678-5");
    expect(rutParaBackend("123456785")).toBe("12345678-5");
  });
});
