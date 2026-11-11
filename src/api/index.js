import { USE_MOCK } from "../config";
import { http } from "./http";
import { E } from "./endpoints";
import { aCategoria, aCliente, aPedido, aProducto, deProducto, rutParaBackend } from "./adapters";
import { pedidosDb, productosDb, usuariosDb } from "../data/db";

const mock = (fn) => new Promise((ok, fail) => setTimeout(() => { try { ok(fn()); } catch (e) { fail(e); } }, 60));
const porProducto = (lista) => new Map((Array.isArray(lista) ? lista : []).map((s) => [Number(s.idProducto), s]));
const stockDe = (id) => http(`${E.stock}/producto/${id}`).catch((e) => (e.status === 404 || e.status === 400 ? null : Promise.reject(e)));

/* ---------- Mock de productos: añade `atributos` y `stockFisico` como lo hace el adaptador real ---------- */
const mockConAtributos = (p) => p && ({ ...p, stockFisico: p.stock, atributos: Object.entries(p.especificaciones ?? {}).map(([k, v]) => ({ idDefinicionAtributo: k, valor: v })) });
const mockDesdeForm = (d) => {
  const { atributos, stockFisico, ...resto } = d;
  const esp = atributos ? Object.fromEntries(atributos.filter((a) => String(a.valor ?? "").trim()).map((a) => [a.idDefinicionAtributo, a.valor])) : resto.especificaciones;
  return { ...resto, stock: stockFisico ?? resto.stock ?? 0, especificaciones: esp };
};

export const productosApi = {
  // Catálogo público: solo PUBLICADOS. admin=true trae todos (incluye BORRADOR/DESPUBLICADO).
  async listar({ admin = false } = {}) {
    if (USE_MOCK) return mock(() => productosDb.listar().map(mockConAtributos));
    const [lista, stocks] = await Promise.all([
      http(admin ? E.productos : `${E.productos}/catalogo`),
      http(E.stock),
    ]);
    const mapa = porProducto(stocks);
    return lista.map((r) => aProducto(r, mapa.get(Number(r.idProducto))));
  },
  async obtener(id) {
    if (USE_MOCK) return mock(() => mockConAtributos(productosDb.obtener(id)));
    const [raw, stock] = await Promise.all([http(`${E.productos}/buscar/${id}`), stockDe(id)]);
    return aProducto(raw, stock);
  },
  async crear(p) {
    if (USE_MOCK) return mock(() => mockConAtributos(productosDb.crear({ ...mockDesdeForm(p), estado: p.estado ?? "PUBLICADO" })));
    const anteriores = await http(E.productos);
    await http(`${E.productos}/crear`, { method: "POST", body: deProducto(p) });
    // ProductoController devuelve un texto, no el Producto creado. Localizarlo por el ID nuevo.
    const lista = await http(E.productos);
    const idsAnteriores = new Set(anteriores.map((r) => Number(r.idProducto)));
    const creados = lista.filter((r) => !idsAnteriores.has(Number(r.idProducto)) && r.nombreProducto === p.nombre && r.modelo === p.modelo);
    const creado = creados.sort((a, b) => Number(b.idProducto) - Number(a.idProducto))[0];
    if (!creado) throw new Error("El servidor creó el producto, pero no se pudo recuperar su ID. Actualiza el listado antes de intentar de nuevo.");
    const stock = await http(`${E.stock}/registrar`, {
      method: "POST",
      body: { idProducto: creado.idProducto, cantidadFisica: Number(p.stockFisico ?? 0), cantidadReservada: 0, stockMinimo: Number(p.stockMinimo ?? 0) },
    });
    return aProducto(creado, stock);
  },
  async actualizar(id, p) {
    if (USE_MOCK) return mock(() => mockConAtributos(productosDb.actualizar(id, mockDesdeForm(p))));
    const anterior = await http(`${E.productos}/buscar/${id}`);
    await http(`${E.productos}/modificar/${id}`, { method: "PUT", body: deProducto(p) });
    // El controlador devuelve un mensaje de texto: el estado real se consulta antes de actualizar.
    if (p.estado && p.estado !== anterior.estado) {
      await http(`${E.productos}/${p.estado === "PUBLICADO" ? "publicar" : "despublicar"}/${id}`, { method: "PUT" });
    }
    // El stock se corrige con un ajuste (ENTRADA / AJUSTE_NEGATIVO) sobre el stock físico.
    const stock = await stockDe(id);
    if (!stock && Number.isFinite(Number(p.stockFisico))) {
      await http(`${E.stock}/registrar`, { method: "POST", body: { idProducto: Number(id), cantidadFisica: Number(p.stockFisico), cantidadReservada: 0, stockMinimo: Number(p.stockMinimo ?? 0) } });
    }
    if (stock && Number.isFinite(Number(p.stockFisico))) {
      const dif = Number(p.stockFisico) - stock.cantidadFisica;
      if (dif !== 0) {
        await http(`${E.stock}/${stock.idStock}/ajustar`, {
          method: "PUT",
          body: { cantidad: Math.abs(dif), tipo: dif > 0 ? "AJUSTE_POSITIVO" : "AJUSTE_NEGATIVO", referenciaOperacion: "PANEL-ADMIN" },
        });
      }
    }
    return this.obtener(id);
  },
  eliminar: (id) => (USE_MOCK ? mock(() => productosDb.eliminar(id)) : http(`${E.productos}/eliminar/${id}`, { method: "DELETE" })),
};

export const categoriasApi = {
  async listar() {
    if (USE_MOCK) {
      return mock(() => {
        const mapa = new Map();
        productosDb.listar().forEach((p) => {
          const c = mapa.get(p.categoria) ?? { id: p.categoria, nombre: p.categoria, atributos: [] };
          Object.keys(p.especificaciones ?? {}).forEach((k) => { if (!c.atributos.some((a) => a.id === k)) c.atributos.push({ id: k, nombre: k, unidad: "", tipoDato: "TEXTO" }); });
          mapa.set(p.categoria, c);
        });
        return [...mapa.values()];
      });
    }
    const lista = await http(E.categorias);
    return Promise.all(lista.map(async (raw) => {
      let atributos = raw.definicionesAtributo ?? raw.definicionesAtributos ?? [];
      try { atributos = await http(`${E.categorias}/${raw.idCategoria}/atributos`); }
      catch { /* conserva las definiciones que incluya el JSON de la categoría */ }
      return aCategoria({ ...raw, definicionesAtributo: Array.isArray(atributos) ? atributos : [] });
    }));
  },
};

export const usuariosApi = {
  // El backend solo expone listar/consultar/actualizar clientes (no hay activar ni eliminar).
  listarClientes: () => (USE_MOCK ? mock(usuariosDb.listarClientes) : http(E.clientes).then((l) => l.map(aCliente))),
  actualizarCliente: (id, datos) => USE_MOCK
    ? mock(() => usuariosDb.actualizar(id, datos))
    : http(`${E.clientes}/${id}`, {
        method: "PUT",
        // El backend actual solo cambia nombre, apellido, teléfono y correo.
        // También recibe el RUT obligatorio del objeto Cliente; no lo modificamos.
        body: { nombre: datos.nombre.trim(), apellido: datos.apellido.trim(),
          correo: datos.email.trim(), rut: rutParaBackend(datos.rut), telefono: datos.telefono.trim(),
          // @Valid Cliente exige un valor no vacío, pero ClienteService NO actualiza contrasena.
          contrasena: "NO_CAMBIAR_CONTRASENA" },
      }).then(aCliente),
};

export const direccionesApi = {
  async predeterminada(idCliente) {
    if (USE_MOCK) return null;
    const lista = await http(`${E.clientes}/${idCliente}/direcciones`);
    const d = lista.find((x) => x.predeterminada) ?? lista[0];
    return d ? { region: d.region, comuna: d.comuna, calle: d.calle, numero: d.numero, departamento: d.deptoCasa ?? "", referencia: d.referencia ?? "" } : null;
  },
};

/*
 * El carrito de compra vive en ServiceCarrito, asociado al cliente, y ServicePedidos crea el pedido leyéndolo.
 * El front conserva su carrito local (para visitantes) y lo sincroniza con el servidor justo antes de pagar.
 */
const carritosMock = new Map();
export const carritoApi = {
  async sincronizar(idCliente, items) {
    if (USE_MOCK) return mock(() => { carritosMock.set(Number(idCliente), items.map((i) => ({ ...i }))); return true; });
    await http(`${E.carritos}/cliente/${idCliente}`, { method: "POST" }); // obtener o crear
    await http(`${E.carritos}/cliente/${idCliente}/items`, { method: "DELETE" }); // vaciar
    for (const i of items) {
      await http(`${E.carritos}/cliente/${idCliente}/items`, { method: "POST", body: { idProducto: i.id, cantidad: i.cantidad } });
    }
    return true;
  },
};

export const pedidosApi = {
  listar: () => (USE_MOCK ? mock(pedidosDb.listar) : http(E.pedidos).then((l) => l.map(aPedido))),
  porCliente: (id) => (USE_MOCK ? mock(() => pedidosDb.porCliente(id)) : http(`${E.pedidos}/cliente/${id}`).then((l) => l.map(aPedido))),
  // datos: { idCliente, modalidadEntrega: DOMICILIO|RETIRO_EN_TIENDA, metodoPago: TARJETA_CREDITO|TARJETA_DEBITO|TRANSFERENCIA, direccion }
  crear: (datos) =>
    USE_MOCK
      ? mock(() => pedidosDb.crear({ ...datos, items: carritosMock.get(Number(datos.idCliente)) ?? [] }))
      : http(E.pedidos, { method: "POST", body: datos }).then(aPedido),
  cambiarEstado: (id, estado) =>
    USE_MOCK ? mock(() => pedidosDb.actualizarEstado(id, estado)) : http(`${E.pedidos}/${id}/estado`, { method: "PUT", body: { estado } }).then(aPedido),
};

export const authApi = {
  async login(email, password) {
    if (USE_MOCK) {
      return mock(() => {
        const u = usuariosDb.buscarPorCredenciales(email, password);
        if (!u) throw new Error("Correo o contraseña incorrectos");
        const { password: _omit, ...usuario } = u;
        return { usuario };
      });
    }
    const r = await http(E.login, { method: "POST", body: { correo: email, contrasena: password } });
    const esAdmin = r.tipoUsuario === "ADMINISTRADOR";
    let nombre = esAdmin ? "Administrador" : r.correo;
    if (!esAdmin) {
      try { nombre = aCliente(await http(`${E.clientes}/${r.idUsuario}`)).nombre || nombre; } catch { /* usa el correo */ }
    }
    return { usuario: { id: r.idUsuario, email: r.correo, nombre, rol: esAdmin ? "Administrador" : "Cliente" } };
  },
  registro: (d) =>
    USE_MOCK
      ? mock(() => {
          if (usuariosDb.existeEmail(d.email)) throw new Error("El correo ya se encuentra registrado");
          return usuariosDb.crear({ nombre: `${d.nombre} ${d.apellido}`.trim(), email: d.email, password: d.password, rut: d.rut, telefono: d.telefono });
        })
      : http(E.clientes, {
          method: "POST",
          body: { correo: d.email, contrasena: d.password, nombre: d.nombre, apellido: d.apellido, rut: rutParaBackend(d.rut), telefono: d.telefono },
        }),
  logout: () => {},
};
