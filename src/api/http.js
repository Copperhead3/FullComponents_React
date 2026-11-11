import { API_URL } from "../config";

export class ApiError extends Error {
  constructor(mensaje, status) { super(mensaje); this.status = status; }
}

// Los GlobalHandlerException responden { fecha, estado, error: "mensaje", detalles?: { campo: mensaje } }.
function mensajeDe(cuerpo, status) {
  if (!cuerpo) return `Error ${status}`;
  if (cuerpo.detalles && typeof cuerpo.detalles === "object") return Object.values(cuerpo.detalles).join(" · ");
  return cuerpo.error || cuerpo.mensaje || cuerpo.message || `Error ${status}`;
}

export async function http(ruta, { method = "GET", body } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${API_URL}${ruta}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. ¿Están levantados el gateway (8090) y los microservicios?", 0);
  }

  if (!res.ok) {
    let cuerpo = null;
    try { cuerpo = await res.json(); } catch { /* sin cuerpo */ }
    throw new ApiError(mensajeDe(cuerpo, res.status), res.status);
  }
  if (res.status === 204) return null;
  const texto = await res.text();
  if (!texto) return null;
  try { return JSON.parse(texto); } catch { return texto; }
}
