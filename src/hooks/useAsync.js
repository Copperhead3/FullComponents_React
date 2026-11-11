import { useCallback, useEffect, useState } from "react";

// Carga datos asíncronos y expone { datos, cargando, error, recargar }.
export default function useAsync(funcion, deps = []) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: null });

  const ejecutar = useCallback(() => {
    let activo = true;
    setEstado((e) => ({ ...e, cargando: true, error: null }));
    funcion()
      .then((datos) => activo && setEstado({ datos, cargando: false, error: null }))
      .catch((err) => activo && setEstado({ datos: null, cargando: false, error: err.message || "Error inesperado" }));
    return () => { activo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(ejecutar, [ejecutar]);
  return { ...estado, recargar: ejecutar };
}
