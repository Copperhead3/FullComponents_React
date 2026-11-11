import { pedidosDb, productosDb, resetDb, suscribir, usuariosDb } from "../data/db";

describe("db simulada (CRUD)", () => {
  beforeEach(() => resetDb({
    productos: [{ id: 1, nombre: "A", precio: 10, stock: 5 }],
    usuarios: [], pedidos: [],
  }));

  it("Create: asigna id incremental", () => {
    expect(productosDb.crear({ nombre: "B", precio: 20, stock: 1 }).id).toBe(2);
    expect(productosDb.listar().length).toBe(2);
  });
  it("Read: obtiene por id y devuelve null si no existe", () => {
    expect(productosDb.obtener(1).nombre).toBe("A");
    expect(productosDb.obtener(99)).toBeNull();
  });
  it("Update: modifica sin cambiar el id", () => {
    productosDb.actualizar(1, { precio: 99, id: 500 });
    expect(productosDb.obtener(1).precio).toBe(99);
    expect(productosDb.obtener(500)).toBeNull();
  });
  it("Delete: elimina", () => {
    productosDb.eliminar(1);
    expect(productosDb.listar()).toEqual([]);
  });
  it("notifica a los suscriptores en cada cambio", () => {
    const espia = jasmine.createSpy("oyente");
    const baja = suscribir(espia);
    productosDb.eliminar(1);
    baja();
    productosDb.crear({ nombre: "C", precio: 1, stock: 1 });
    expect(espia).toHaveBeenCalledTimes(1);
  });
  it("un pedido calcula totales, descuenta stock y cobra despacho solo a domicilio", () => {
    const dom = pedidosDb.crear({ idCliente: 1, items: [{ id: 1, cantidad: 2 }], modalidadEntrega: "DOMICILIO", metodoPago: "TRANSFERENCIA" });
    expect(dom.subtotal).toBe(20);
    expect(dom.total).toBe(20 + dom.costoDespacho);
    expect(dom.costoDespacho).toBeGreaterThan(0);
    expect(productosDb.obtener(1).stock).toBe(3);
    const retiro = pedidosDb.crear({ idCliente: 1, items: [{ id: 1, cantidad: 1 }], modalidadEntrega: "RETIRO_EN_TIENDA", metodoPago: "TRANSFERENCIA" });
    expect(retiro.costoDespacho).toBe(0);
  });
  it("rechaza pedidos sin stock suficiente", () => {
    expect(() => pedidosDb.crear({ idCliente: 1, items: [{ id: 1, cantidad: 99 }], modalidadEntrega: "RETIRO_EN_TIENDA" })).toThrowError(/Stock insuficiente/);
  });
  it("filtra pedidos por cliente y actualiza su estado", () => {
    const p = pedidosDb.crear({ idCliente: 7, items: [{ id: 1, cantidad: 1 }], modalidadEntrega: "RETIRO_EN_TIENDA" });
    expect(pedidosDb.porCliente(7).length).toBe(1);
    expect(pedidosDb.porCliente(8).length).toBe(0);
    expect(pedidosDb.actualizarEstado(p.id, "ENVIADO").estado).toBe("ENVIADO");
  });
  it("usuarios: no expone contraseñas y detecta correos duplicados", () => {
    usuariosDb.crear({ nombre: "Ana", email: "ana@x.cl", password: "secreto" });
    expect(usuariosDb.listarClientes()[0].password).toBeUndefined();
    expect(usuariosDb.existeEmail("ANA@x.cl")).toBeTrue();
  });
});
