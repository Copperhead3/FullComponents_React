import { Link } from "react-router-dom";

export default function Footer() {
  return <footer className="footer-principal">
    <div className="container">
      <div className="row g-4">
        <div className="col-12 col-md-6 col-lg-4"><h2 className="footer-logo"><span>▣</span> FullComponents Store</h2><p className="footer-descripcion">Componentes para grandes ideas. Encuentra todo lo que necesitas para armar, mejorar y potenciar tu PC.</p></div>
        <div className="col-6 col-md-3 col-lg-2"><h3 className="footer-titulo">Comprar</h3><ul className="footer-links"><li><Link to="/">Inicio</Link></li><li><Link to="/catalogo">Categorías</Link></li><li><Link to="/catalogo">Catálogo</Link></li><li><Link to="/ofertas">Ofertas</Link></li></ul></div>
        <div className="col-6 col-md-3 col-lg-3"><h3 className="footer-titulo">Mi cuenta</h3><ul className="footer-links"><li><Link to="/login">Ingresar / Registrarme</Link></li><li><Link to="/carrito">Carrito</Link></li><li><Link to="/mis-pedidos">Mis pedidos</Link></li></ul></div>
        <div className="col-12 col-md-6 col-lg-3"><h3 className="footer-titulo">Contacto</h3><p className="footer-contacto">¿Necesitas ayuda con tu compra?</p><a href="mailto:contacto@fullcomponents.cl" className="footer-correo">contacto@fullcomponents.cl</a><p className="footer-horario">Lunes a viernes<br />09:00 a 18:00 hrs.</p></div>
      </div>
      <div className="footer-inferior"><p>© {new Date().getFullYear()} FullComponents Store. Todos los derechos reservados.</p><div className="footer-legales">Compra segura y responsable</div></div>
    </div>
  </footer>;
}
