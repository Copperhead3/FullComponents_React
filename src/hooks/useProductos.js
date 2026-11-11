import { productosApi } from "../api";
import useAsync from "./useAsync";

// admin=true incluye productos en BORRADOR/DESPUBLICADO (solo para el panel de administración).
export default function useProductos({ admin = false } = {}) {
  const r = useAsync(() => productosApi.listar({ admin }), [admin]);
  return { productos: r.datos ?? [], cargando: r.cargando, error: r.error, recargar: r.recargar };
}
