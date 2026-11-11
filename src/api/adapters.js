/*
 * Traduce entre las entidades Spring y el formato del front.
 *   Producto.idProducto/nombreProducto/precioVigente  <->  id/nombre/precio
 *   El stock vive en ServiceInventario (cantidadFisica - cantidadReservada = disponible).
 */
// Algunos registros de la semilla inicial se guardaron con texto UTF-8 interpretado como Latin-1.
// Se corrige solo para mostrar en pantalla, sin cambiar los IDs ni las consultas al backend.
export const textoLegible = (valor) => String(valor ?? "")
  .replace(/Ã¡/g, "á").replace(/Ã©/g, "é").replace(/Ã­/g, "í")
  .replace(/Ã³/g, "ó").replace(/Ãº/g, "ú").replace(/Ã±/g, "ñ")
  .replace(/Ã/g, "Á").replace(/Ã‰/g, "É").replace(/Ã“/g, "Ó");
const nombreAtributo = (d = {}) => textoLegible(d.nombreAtributo ?? d.nombreDefinicionAtributo ?? d.clave ?? "");

export function aProducto(raw, stock) {
  const imagenes = [...(raw.imagenes ?? [])].sort(
    (a, b) => Number(!!b.esPrincipal) - Number(!!a.esPrincipal) || (a.orden ?? 0) - (b.orden ?? 0)
  );
  const especificaciones = {};
  const atributos = [];
  (raw.especificaciones ?? []).forEach((e) => {
    const d = e.definicionAtributo ?? {};
    const nombre = nombreAtributo(d);
    especificaciones[d.unidad ? `${nombre} (${d.unidad})` : nombre] = e.valor;
    atributos.push({ idDefinicionAtributo: d.idDefinicionAtributo, valor: e.valor });
  });
  const fisica = stock?.cantidadFisica ?? 0;
  return {
    id: raw.idProducto,
    nombre: raw.nombreProducto,
    categoria: textoLegible(raw.categoria?.nombreCategoria ?? ""),
    categoriaId: raw.categoria?.idCategoria ?? null,
    marca: raw.marca,
    modelo: raw.modelo,
    precio: Number(raw.precioVigente),
    estado: raw.estado,
    imagen: imagenes[0]?.url ?? "",
    imagenes: imagenes.map(i => i.url).filter(Boolean),
    garantia: raw.garantia ?? null,
    informacionDespacho: raw.informacionDespacho ?? null,
    relacionados: (raw.relacionados ?? []).map(r => ({ id: r.idProducto, nombre: r.nombreProducto, precio: Number(r.precioVigente) })),
    descripcion: raw.descripcion ?? "",
    especificaciones,
    atributos,
    stock: Math.max(0, fisica - (stock?.cantidadReservada ?? 0)), // disponible para vender
    stockFisico: fisica,
    stockMinimo: stock?.stockMinimo ?? 0,
    idStock: stock?.idStock ?? null,
  };
}

export function aCategoria(raw) {
  return {
    id: raw.idCategoria,
    nombre: textoLegible(raw.nombreCategoria),
    atributos: (raw.definicionesAtributo ?? raw.definicionesAtributos ?? []).map((d) => ({
      id: d.idDefinicionAtributo,
      nombre: nombreAtributo(d),
      unidad: d.unidad ?? "",
      tipoDato: d.tipoDato,
    })),
  };
}

const formatoDe = (url) => (String(url).split("?")[0].split(".").pop() || "jpg").toLowerCase().slice(0, 20);

// Cuerpo que espera POST /crear y PUT /modificar/{id}
export function deProducto(p) {
  return {
    nombreProducto: p.nombre,
    marca: p.marca,
    modelo: p.modelo,
    descripcion: p.descripcion,
    precioVigente: p.precio,
    estado: p.estado ?? "BORRADOR",
    categoria: { idCategoria: p.categoriaId },
    garantia: { periodoMeses: p.garantiaMeses === "" || p.garantiaMeses == null ? null : Number(p.garantiaMeses), condicionesGarantia: p.condicionesGarantia ?? "" },
    informacionDespacho: { condicionesDespacho: p.condicionesDespacho ?? "", plazoReferencial: p.plazoReferencial ?? "" },
    imagenes: p.imagen ? [{ url: p.imagen, formato: formatoDe(p.imagen), orden: 0, esPrincipal: true }] : [],
    especificaciones: (p.atributos ?? [])
      .filter((a) => String(a.valor ?? "").trim() !== "")
      .map((a) => ({ valor: String(a.valor).trim(), definicionAtributo: { idDefinicionAtributo: a.idDefinicionAtributo } })),
  };
}

export const aPedido = (r) => ({
  id: r.idPedido,
  idCliente: r.idCliente,
  fecha: r.fechaPedido,
  estado: r.estado,
  subtotal: Number(r.subtotal),
  costoDespacho: Number(r.costoDespacho),
  total: Number(r.total),
  idPago: r.idPago,
  idDespacho: r.idDespacho,
  detalles: (r.detalles ?? []).map((d) => ({
    idProducto: d.idProducto,
    nombre: d.nombreProducto,
    cantidad: d.cantidad,
    precioUnitario: Number(d.precioUnitario),
    subtotal: Number(d.subtotal),
  })),
});

export const aCliente = (c) => ({
  id: c.idUsuario,
  nombre: `${c.nombre ?? ""} ${c.apellido ?? ""}`.trim(),
  nombres: c.nombre ?? "",
  apellido: c.apellido ?? "",
  email: c.correo,
  rut: c.rut,
  telefono: c.telefono ?? "",
  rol: "Cliente",
  fechaRegistro: c.fechaRegistro ?? "",
});

// El backend exige 12345678-9 (sin puntos y con guion).
export function rutParaBackend(rut) {
  const limpio = String(rut).replace(/[.\s]/g, "").toUpperCase();
  return limpio.includes("-") ? limpio : `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
}
