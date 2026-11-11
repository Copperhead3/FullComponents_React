import { categoriasApi } from "../api";
import useAsync from "./useAsync";

export default function useCategorias() {
  const r = useAsync(() => categoriasApi.listar(), []);
  return { categorias: r.datos ?? [], cargando: r.cargando, error: r.error };
}
