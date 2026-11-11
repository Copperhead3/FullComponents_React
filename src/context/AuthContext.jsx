import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authApi } from "../api";

const CLAVE = "usuarioActivo";
const AuthContext = createContext(null);

function leer() {
  try { return JSON.parse(sessionStorage.getItem(CLAVE)); } catch { return null; }
}

export const esRolAdmin = (u) => !!u && ["administrador", "admin"].includes(String(u.rol).toLowerCase());

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leer);

  const login = useCallback(async (email, password) => {
    const { usuario: u } = await authApi.login(email, password);
    sessionStorage.setItem(CLAVE, JSON.stringify(u));
    setUsuario(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    sessionStorage.removeItem(CLAVE);
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, esAdmin: esRolAdmin(usuario), login, logout, registro: authApi.registro }),
    [usuario, login, logout]
  );
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};
