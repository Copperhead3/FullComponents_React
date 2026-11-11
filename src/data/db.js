/*
 * "Base de datos" simulada en memoria con CRUD completo.
 * Se usa cuando VITE_USE_MOCK=true y en las pruebas unitarias.
 * Persiste en localStorage para sobrevivir recargas (si está disponible).
 */
import { productosIniciales } from "./productosIniciales";

const LS_KEY = "fc-mock-db-v1";

const semilla = () => ({
  productos: JSON.parse(JSON.stringify(productosIniciales)),
  usuarios: [
    { id: 1, nombre: "Administrador", email: "admin@fullcomponents.cl", password: "admin123", rol: "Administrador", rut: "", telefono: "", fechaRegistro: "" },
  ],
  pedidos: [],
});

let estado = cargar();
const oyentes = new Set();

function cargar() {
  try {
    const g = typeof localStorage !== "undefined" && localStorage.getItem(LS_KEY);
    if (g) return JSON.parse(g);
  } catch { /* usa semilla */ }
  return semilla();
}

function guardar() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(estado)); } catch { /* sin storage */ }
  oyentes.forEach((fn) => fn());
}

export const suscribir = (fn) => { oyentes.add(fn); return () => oyentes.delete(fn); };
export const resetDb = (datos) => { estado = datos ?? semilla(); guardar(); };

const siguienteId = (lista) => lista.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;

/* ---------- Productos ---------- */
export const productosDb = {
  listar: () => estado.productos.map((p) => ({ ...p })),
  obtener: (id) => { const p = estado.productos.find((x) => Number(x.id) === Number(id)); return p ? { ...p } : null; },
  crear: (datos) => {
    const nuevo = { ...datos, id: siguienteId(estado.productos) };
    estado.productos = [...estado.productos, nuevo];
    guardar();
    return { ...nuevo };
  },
  actualizar: (id, cambios) => {
    estado.productos = estado.productos.map((p) => (Number(p.id) === Number(id) ? { ...p, ...cambios, id: p.id } : p));
    guardar();
    return productosDb.obtener(id);
  },
  eliminar: (id) => {
    estado.productos = estado.productos.filter((p) => Number(p.id) !== Number(id));
    guardar();
  },
};

/* ---------- Usuarios ---------- */
export const usuariosDb = {
  listarClientes: () => estado.usuarios.filter((u) => u.rol === "Cliente").map(({ password, ...u }) => u),
  obtener: (id) => { const u = estado.usuarios.find((x) => x.id === Number(id)); if (!u) return null; const { password, ...pub } = u; return pub; },
  buscarPorCredenciales: (email, password) => estado.usuarios.find((u) => u.email === email && u.password === password) ?? null,
  existeEmail: (email) => estado.usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase()),
  actualizar: (id, datos) => {
    const u = estado.usuarios.find((x) => x.id === Number(id));
    if (!u) throw new Error("Cliente no encontrado");
    if (estado.usuarios.some((x) => x.id !== u.id && x.email?.toLowerCase() === datos.email.toLowerCase())) throw new Error("El correo ya está registrado");
    Object.assign(u, { nombre: `${datos.nombre} ${datos.apellido}`.trim(), email: datos.email, telefono: datos.telefono });
    guardar();
    const { password: _sinClave, ...publico } = u;
    return publico;
  },
  crear: (datos) => {
    const nuevo = { rol: "Cliente", fechaRegistro: new Date().toISOString(), ...datos, id: siguienteId(estado.usuarios) };
    estado.usuarios = [...estado.usuarios, nuevo];
    guardar();
    const { password, ...publico } = nuevo;
    return publico;
  },
};

/* ---------- Pedidos (misma forma que el front obtiene del backend) ---------- */
export const pedidosDb = {
  listar: () => estado.pedidos.map((p) => ({ ...p })),
  porCliente: (idCliente) => estado.pedidos.filter((p) => p.idCliente === Number(idCliente)).map((p) => ({ ...p })),
  // items: [{ id, cantidad }] (el carrito del cliente). En el backend real los reserva ServiceInventario.
  crear: ({ idCliente, items, modalidadEntrega, metodoPago, direccion }) => {
    if (!items?.length) throw new Error("El carrito está vacío");
    const detalles = items.map((it) => {
      const p = estado.productos.find((x) => Number(x.id) === Number(it.id));
      if (!p || p.stock < it.cantidad) throw new Error(`Stock insuficiente para ${p?.nombre ?? "el producto"}`);
      return { idProducto: p.id, nombre: p.nombre, cantidad: it.cantidad, precioUnitario: p.precio, subtotal: p.precio * it.cantidad };
    });
    detalles.forEach((d) => { const p = estado.productos.find((x) => x.id === d.idProducto); p.stock -= d.cantidad; });
    const subtotal = detalles.reduce((s, d) => s + d.subtotal, 0);
    const costoDespacho = modalidadEntrega === "DOMICILIO" ? 5990 : 0;
    const nuevo = {
      id: siguienteId(estado.pedidos), idCliente: Number(idCliente), fecha: new Date().toISOString(), estado: "CONFIRMADO",
      subtotal, costoDespacho, total: subtotal + costoDespacho, detalles, modalidadEntrega, metodoPago, direccion,
    };
    estado.pedidos = [...estado.pedidos, nuevo];
    guardar();
    return { ...nuevo };
  },
  actualizarEstado: (id, nuevoEstado) => {
    estado.pedidos = estado.pedidos.map((p) => (p.id === Number(id) ? { ...p, estado: nuevoEstado } : p));
    guardar();
    return estado.pedidos.find((p) => p.id === Number(id));
  },
};
