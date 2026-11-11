import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import useCategorias from "../hooks/useCategorias";


export default function Navbar() {
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);
  const [cats, setCats] = useState(false);
  const { usuario, esAdmin, logout } = useAuth();
  const { cantidadTotal } = useCart();
  const navigate = useNavigate();
  const { categorias } = useCategorias();

  const buscar = (e) => {
    e.preventDefault();
    navigate(`/catalogo?q=${encodeURIComponent(q.trim())}`);
  };

  const sesion = () => {
    if (!usuario) return navigate("/login");
    if (esAdmin) return navigate("/admin");
    if (window.confirm(`¿Cerrar sesión de ${usuario.nombre}?`)) logout();
  };

  return (
    <header>
      <nav className="navbar navbar-dark navbar-principal">
        <div className="container-fluid px-4">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <span className="logo-icon">▣</span>
            <span className="logo-text-mobile ms-2 d-md-none">FC Store</span>
            <div className="ms-2 d-none d-md-block">
              <span className="logo-text">FullComponents Store</span>
              <small className="d-block logo-subtitle">Componentes para grandes ideas</small>
            </div>
          </Link>

          <form className="d-flex buscador flex-grow-1" role="search" onSubmit={buscar}>
            <input className="form-control" type="search" value={q} onChange={(e) => setQ(e.target.value)}
                   placeholder="Buscar productos, marcas o categorías..." aria-label="Buscar productos" />
            <button className="btn btn-buscar" type="submit" aria-label="Buscar">🔍</button>
          </form>

          <div className="nav-opciones d-flex align-items-center">
            <button type="button" className="nav-link text-white me-4 btn btn-link" onClick={sesion} id="linkSesion">
              👤 <span className="d-none d-md-inline texto-sesion">{usuario ? (esAdmin ? "Administrador" : usuario.nombre) : "Iniciar sesión"}</span>
            </button>
            <Link to="/carrito" className="nav-link text-white carrito me-4" aria-label="Ver carrito">
              🛒 <span className="d-none d-md-inline">Carrito</span>{" "}
              <span className="badge rounded-pill" data-testid="contador-carrito">{cantidadTotal}</span>
            </Link>
          </div>
        </div>
      </nav>

      <nav className="navbar navbar-expand-lg navbar-dark navbar-secundaria">
        <div className="container-fluid px-4">
          <button className="navbar-toggler" type="button" onClick={() => setMenu(!menu)} aria-label="Abrir menú">
            <span className="navbar-toggler-icon" />
          </button>
          <div className={`collapse navbar-collapse ${menu ? "show" : ""}`}>
            <ul className="navbar-nav">
              <li className="nav-item"><NavLink className="nav-link" to="/" end>Inicio</NavLink></li>
              <li className={`nav-item dropdown ${cats ? "show" : ""}`}>
                <button className="nav-link dropdown-toggle btn btn-link" onClick={() => setCats(!cats)}>Categorías</button>
                <ul className={`dropdown-menu ${cats ? "show" : ""}`}>
                  {categorias.map(({ nombre: c }) => (
                    <li key={c}>
                      <Link className="dropdown-item" to={`/catalogo?categoria=${encodeURIComponent(c)}`}
                            onClick={() => { setCats(false); setMenu(false); }}>{c}</Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="nav-item"><NavLink className="nav-link" to="/catalogo">Catálogo</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/ofertas">Ofertas</NavLink></li>
              {usuario && !esAdmin && <li className="nav-item"><NavLink className="nav-link" to="/mis-pedidos">Mis pedidos</NavLink></li>}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
