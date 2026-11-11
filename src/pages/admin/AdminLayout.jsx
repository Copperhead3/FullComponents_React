import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Resumen from "./Resumen";
import ProductosAdmin from "./ProductosAdmin";
import PedidosAdmin from "./PedidosAdmin";
import UsuariosAdmin from "./UsuariosAdmin";

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const link = ({ isActive }) => `nav-link ${isActive ? "active" : ""}`;

  return (
    <div className="container-fluid">
      <div className="row">
        <nav className="col-md-3 col-lg-2 bg-light py-3 min-vh-100">
          <h2 className="h6 text-uppercase text-muted px-3">Administración</h2>
          <ul className="nav flex-column">
            <li><NavLink end to="/admin" className={link}>Resumen</NavLink></li>
            <li><NavLink to="/admin/productos" className={link}>Productos</NavLink></li>
            <li><NavLink to="/admin/pedidos" className={link}>Pedidos</NavLink></li>
            <li><NavLink to="/admin/usuarios" className={link}>Usuarios</NavLink></li>
            <li><button className="nav-link btn btn-link text-danger" onClick={() => { logout(); navigate("/"); }}>Cerrar sesión</button></li>
          </ul>
        </nav>
        <main className="col-md-9 col-lg-10 py-4">
          <Routes>
            <Route index element={<Resumen />} />
            <Route path="productos" element={<ProductosAdmin />} />
            <Route path="pedidos" element={<PedidosAdmin />} />
            <Route path="usuarios" element={<UsuariosAdmin />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
