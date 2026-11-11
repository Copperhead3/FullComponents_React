import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Protege las vistas de administración. OJO: esto es solo UX; la autorización real debe hacerla el backend.
export default function RutaAdmin({ children }) {
  const { esAdmin } = useAuth();
  return esAdmin ? children : <Navigate to="/login" replace />;
}
