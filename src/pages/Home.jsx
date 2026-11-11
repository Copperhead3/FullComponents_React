import { Link } from "react-router-dom";
import Banner from "../components/Banner";
import ProductCard from "../components/ProductCard";
import Estado from "../components/Estado";
import useProductos from "../hooks/useProductos";
import useCategorias from "../hooks/useCategorias";
import { formatearPrecio, rutaImagen } from "../utils/format";

const OFERTAS = [
  "/img/ofertas/Gemini_Generated_Image_xhcpzqxhcpzqxhcp.jpg",
  "/img/ofertas/Gemini_Generated_Image_eyzs03eyzs03eyzs.jpg",
  "/img/ofertas/Gemini_Generated_Image_ws1t5uws1t5uws1t.jpg",
  "/img/ofertas/Gemini_Generated_Image_hcq4xghcq4xghcq4.jpg",
];
const IMG_CATEGORIA = {
  Procesadores: "/img/categorias/ChatGPT Image 23 sept 2026, 16_55_51.png",
  "Tarjetas gráficas": "/img/categorias/ChatGPT Image 23 sept 2026, 17_04_50.png",
  "Placas madre": "/img/categorias/placa.png",
  "Memorias RAM": "/img/categorias/ram.png",
  Almacenamiento: "/img/categorias/almacenamiento.png",
  "Fuentes de poder": "/img/categorias/fuentes.png",
  Gabinetes: "/img/categorias/gabinetes.png",
};
const beneficios = [
  ["🚚", "Envíos a todo Chile", "Revisa la cobertura durante tu compra."],
  ["🛡️", "Pagos seguros", "Los pagos se gestionan mediante el servicio de pago de la tienda."],
  ["✓", "Componentes para tu PC", "Consulta las especificaciones técnicas antes de comprar."],
  ["🎧", "Atención a clientes", "Contáctanos si necesitas ayuda."],
];

export default function Home() {
  const { productos, cargando, error, recargar } = useProductos();
  const { categorias } = useCategorias();
  const destacados = productos.slice(0, 5);
  const seleccion = ["Kingston", "Corsair", "MSI"].map(marca => productos.find(p => p.nombre.toLowerCase().includes(marca.toLowerCase()))).filter(Boolean);
  return <main>
    <section className="seccion-banner"><Banner imagenes={OFERTAS.map(rutaImagen)} /></section>
    <section className="seccion-categorias" aria-labelledby="titulo-categorias"><div className="container">
      <div className="mb-4"><h2 id="titulo-categorias" className="titulo-seccion">Categorías principales</h2><p className="subtitulo-seccion">Encuentra los componentes que necesitas para tu próximo PC.</p></div>
      <div className="row g-4">
        {categorias.map(({ nombre }) => <div className="col-6 col-md-4 col-lg-3" key={nombre}>
          <Link to={`/catalogo?categoria=${encodeURIComponent(nombre)}`} className="tarjeta-categoria">
            <img className="img-categoria" src={rutaImagen(IMG_CATEGORIA[nombre])} alt={nombre} loading="lazy" />
            <h3>{nombre}</h3><span>Ver productos →</span>
          </Link>
        </div>)}
        {!categorias.some(c => c.nombre === "Placas madre") && <div className="col-6 col-md-4 col-lg-3"><div className="tarjeta-categoria categoria-proximamente">
          <img className="img-categoria" src={rutaImagen(IMG_CATEGORIA["Placas madre"])} alt="Placas madre" loading="lazy" /><h3>Placas madre</h3><span>Próximamente</span>
        </div></div>}
      </div>
    </div></section>
    <section className="seccion-productos" aria-labelledby="titulo-productos"><div className="container">
      <h2 id="titulo-productos" className="titulo-seccion mb-4">Productos destacados</h2>
      <Estado cargando={cargando} error={error} onReintentar={recargar}/>
      <div className="row g-4 row-cols-2 row-cols-md-3 row-cols-lg-5">{destacados.map(p => <div className="col" key={p.id}><ProductCard producto={p}/></div>)}</div>
    </div></section>
    <section className="seccion-ofertas" aria-labelledby="titulo-ofertas"><div className="container"><div className="row g-4 align-items-center">
      <div className="col-12 col-lg-4"><div className="ofertas-presentacion"><h2 id="titulo-ofertas">Productos <span>seleccionados</span></h2><p>Descubre nuestros componentes favoritos y consulta precios reales desde el backend.</p><Link to="/ofertas" className="btn btn-ver-ofertas">Ver selección →</Link></div></div>
      <div className="col-12 col-lg-8"><div className="row g-3 row-cols-1 row-cols-sm-3">{seleccion.map(p => <div className="col" key={p.id}><Link to={`/producto/${p.id}`} className="tarjeta-oferta">
        <img className="oferta-imagen" src={rutaImagen(p.imagen)} alt={p.nombre} loading="lazy"/><h3>{p.nombre}</h3><div className="oferta-precios"><span className="oferta-precio-actual">{formatearPrecio(p.precio)}</span></div>
      </Link></div>)}</div></div>
    </div></div></section>
    <section className="seccion-beneficios" aria-label="Beneficios de FullComponents Store"><div className="container"><div className="row g-4">{beneficios.map(([icono,titulo,texto]) => <div key={titulo} className="col-6 col-lg-3"><div className="beneficio"><span className="beneficio-icono" aria-hidden="true">{icono}</span><div><h3>{titulo}</h3><p>{texto}</p></div></div></div>)}</div></div></section>
  </main>;
}
