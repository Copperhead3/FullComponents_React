import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { carritoApi, direccionesApi, pedidosApi, usuariosApi } from "../api";
import Estado from "../components/Estado";
import ImagenProducto from "../components/ImagenProducto";
import useProductos from "../hooks/useProductos";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { calcularTotal } from "../utils/cart";
import { formatearPrecio } from "../utils/format";

const DIR_VACIA = { region: "", comuna: "", calle: "", numero: "", departamento: "", referencia: "" };
const REGIONES = ["Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío", "La Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"];
const METODOS = [["TARJETA_CREDITO", "Tarjeta de crédito"], ["TARJETA_DEBITO", "Tarjeta de débito"], ["TRANSFERENCIA", "Transferencia"]];

export default function Checkout() {
  const { usuario, esAdmin } = useAuth();
  const { items, vaciar } = useCart();
  const { productos, cargando, error, recargar } = useProductos();
  const [modalidad, setModalidad] = useState("DOMICILIO");
  const [metodo, setMetodo] = useState("TARJETA_CREDITO");
  const [dir, setDir] = useState(DIR_VACIA);
  const [contacto, setContacto] = useState({ nombre: "", apellido: "", rut: "", telefono: "", correo: "" });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [falla, setFalla] = useState("");
  const [pedido, setPedido] = useState(null);

  useEffect(() => {
    if (!usuario || esAdmin) return;
    let activo = true;
    setContacto(c => ({ ...c, correo: usuario.email || c.correo }));
    Promise.allSettled([usuariosApi.listarClientes(), direccionesApi.predeterminada(usuario.id)]).then(([cli, direccion]) => {
      if (!activo) return;
      if (cli.status === "fulfilled") {
        const encontrado = cli.value.find(c => Number(c.id) === Number(usuario.id));
        if (encontrado) setContacto({ nombre: encontrado.nombres || "", apellido: encontrado.apellido || "", rut: encontrado.rut || "", telefono: encontrado.telefono || "", correo: encontrado.email || usuario.email || "" });
      }
      if (direccion.status === "fulfilled" && direccion.value) setDir(d => ({ ...d, ...direccion.value }));
    });
    return () => { activo = false; };
  }, [usuario?.id, esAdmin]);

  const lineas = useMemo(() => items.map(i => ({ ...i, producto: productos.find(p => Number(p.id) === i.id) })).filter(l => l.producto), [items, productos]);
  const subtotal = calcularTotal(items, productos);
  const cambiarDir = e => setDir(d => ({ ...d, [e.target.name]: e.target.value }));
  const cambiarContacto = e => setContacto(c => ({ ...c, [e.target.name]: e.target.value }));

  const confirmar = async ev => {
    ev.preventDefault();
    setFalla("");
    const e = {};
    for (const k of ["nombre", "apellido", "rut", "telefono", "correo"]) if (!String(contacto[k] ?? "").trim()) e[k] = "Campo obligatorio.";
    if (contacto.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto.correo)) e.correo = "Ingresa un correo válido.";
    if (modalidad === "DOMICILIO") for (const k of ["region", "comuna", "calle", "numero"]) if (!String(dir[k] ?? "").trim()) e[k] = "Campo obligatorio.";
    setErrores(e);
    if (Object.keys(e).length) return;
    if (lineas.length !== items.length) { setFalla("Hay productos que ya no están disponibles en el catálogo. Revisa tu carrito."); return; }
    if (lineas.some(l => l.cantidad > l.producto.stock)) { setFalla("Uno de los productos supera el stock disponible."); return; }
    setEnviando(true);
    try {
      // Mantener el contrato de los microservicios: solo IDs, modalidad, método y dirección.
      // Datos personales y tarjetas nunca se envían al servicio de pago desde el navegador.
      await carritoApi.sincronizar(usuario.id, items);
      const creado = await pedidosApi.crear({ idCliente: usuario.id, modalidadEntrega: modalidad, metodoPago: metodo, direccion: modalidad === "DOMICILIO" ? dir : null });
      vaciar();
      setPedido(creado);
    } catch (err) { setFalla(err.message); } finally { setEnviando(false); }
  };

  const campo = (name, label, valor, onChange, col="col-md-6", extra={}) => <div className={col} key={name}><label htmlFor={`checkout-${name}`} className="form-label">{label}</label><input id={`checkout-${name}`} name={name} className={`form-control ${errores[name] ? "is-invalid" : ""}`} value={valor ?? ""} onChange={onChange} {...extra}/>{errores[name] && <div className="invalid-feedback">{errores[name]}</div>}</div>;

  if (pedido) return <main className="container py-5 text-center"><h1 className="h3 text-success">¡Compra realizada!</h1><p>Pedido N° <strong>{pedido.id}</strong> · estado {pedido.estado}</p><p>Subtotal {formatearPrecio(pedido.subtotal)} + despacho {formatearPrecio(pedido.costoDespacho)} = <strong>{formatearPrecio(pedido.total)}</strong></p><Link to="/mis-pedidos" className="btn btn-primary me-2">Ver mis pedidos</Link><Link to="/" className="btn btn-outline-primary">Volver al inicio</Link></main>;
  if (!usuario || esAdmin) return <main className="container py-5 text-center"><h1 className="h4">{esAdmin ? "Las cuentas de administrador no pueden comprar" : "Inicia sesión para finalizar tu compra"}</h1>{!esAdmin && <Link to="/login" className="btn btn-primary mt-3">Iniciar sesión o registrarme</Link>}</main>;
  if (cargando || error) return <main className="container py-4"><Estado cargando={cargando} error={error} onReintentar={recargar}/></main>;
  if (!items.length) return <main className="container py-5 text-center"><h1 className="h4">Tu carrito está vacío</h1><Link to="/catalogo">Ir al catálogo</Link></main>;

  return <main className="checkout-pagina"><div className="container py-5">
    <div className="mb-4"><Link to="/carrito" className="text-decoration-none">← Volver al carrito</Link><h1 className="h2 mt-3 mb-1">Finalizar compra</h1><p className="text-muted">Completa tus datos para realizar tu pedido.</p></div>
    {falla && <div className="alert alert-danger" role="alert">{falla}</div>}
    <div className="row g-4 align-items-start"><div className="col-lg-8"><form id="formCheckout" onSubmit={confirmar} noValidate>
      <section className="checkout-card mb-4"><div className="checkout-card-header"><span className="checkout-numero">1</span><div><h2 className="h5 mb-0">Datos del comprador</h2><small className="text-muted">Información de contacto</small></div></div>
        <div className="row g-3 mt-1">{campo("nombre","Nombre",contacto.nombre,cambiarContacto)}{campo("apellido","Apellido",contacto.apellido,cambiarContacto)}{campo("rut","RUT",contacto.rut,cambiarContacto,"col-md-6",{placeholder:"12.345.678-9"})}{campo("telefono","Teléfono",contacto.telefono,cambiarContacto,"col-md-6",{type:"tel",placeholder:"+56 9 1234 5678"})}{campo("correo","Correo electrónico",contacto.correo,cambiarContacto,"col-12",{type:"email",placeholder:"ejemplo@correo.cl"})}<div className="col-12"><p className="form-text mt-0 mb-0">Los datos de compra corresponden a tu cuenta. Para cambiarlos de forma permanente, actualiza tu perfil.</p></div></div>
      </section>
      <section className="checkout-card mb-4"><div className="checkout-card-header"><span className="checkout-numero">2</span><div><h2 className="h5 mb-0">Dirección de envío</h2><small className="text-muted">¿Dónde quieres recibir tu compra?</small></div></div>
        <div className="d-flex flex-wrap gap-3 mt-3 mb-3"><label className="form-check-label"><input className="form-check-input me-2" type="radio" checked={modalidad === "DOMICILIO"} onChange={() => setModalidad("DOMICILIO")}/>Despacho a domicilio</label><label className="form-check-label"><input className="form-check-input me-2" type="radio" checked={modalidad === "RETIRO_EN_TIENDA"} onChange={() => setModalidad("RETIRO_EN_TIENDA")}/>Retiro en tienda</label></div>
        {modalidad === "DOMICILIO" ? <div className="row g-3 mt-1"><div className="col-md-6"><label htmlFor="checkout-region" className="form-label">Región</label><select id="checkout-region" name="region" value={dir.region} onChange={cambiarDir} className={`form-select ${errores.region ? "is-invalid" : ""}`}><option value="">Selecciona una región</option>{REGIONES.map(r => <option key={r}>{r}</option>)}</select>{errores.region && <div className="invalid-feedback">{errores.region}</div>}</div>{campo("comuna","Comuna",dir.comuna,cambiarDir)}{campo("calle","Calle",dir.calle,cambiarDir,"col-md-8")}{campo("numero","Número",dir.numero,cambiarDir,"col-md-4")}{campo("departamento","Departamento / Casa",dir.departamento,cambiarDir)}{campo("referencia","Referencia",dir.referencia,cambiarDir,"col-md-6",{placeholder:"Ej: casa esquina"})}</div> : <p className="text-muted mt-3 mb-0">Retirarás tu compra en tienda. El servicio de pedidos calculará el despacho como corresponda.</p>}
      </section>
      <section className="checkout-card mb-4"><div className="checkout-card-header"><span className="checkout-numero">3</span><div><h2 className="h5 mb-0">Método de pago</h2><small className="text-muted">Pago simulado para fines académicos</small></div></div>
        <div className="alert alert-light border mt-4">💳 <strong>Selecciona cómo quieres pagar</strong></div><label htmlFor="checkout-metodo" className="form-label">Método de pago</label><select id="checkout-metodo" className="form-select" value={metodo} onChange={e => setMetodo(e.target.value)}>{METODOS.map(([v,t]) => <option key={v} value={v}>{t}</option>)}</select>
        <div className="alert alert-warning mt-4 mb-0"><small>⚠️ Esta es una simulación académica. No ingreses números de tarjeta, fechas de vencimiento ni CVV reales. El pago se procesa mediante el microservicio, sin recoger datos bancarios en React.</small></div>
      </section>
    </form></div>
    <aside className="col-lg-4"><div className="checkout-card resumen-pedido"><h2 className="h5 mb-4">Resumen del pedido</h2><div className="checkout-productos">{lineas.map(({producto:p,cantidad}) => <div className="producto-checkout" key={p.id}><ImagenProducto src={p.imagen} alt={p.nombre} className="producto-checkout-imagen"/><div className="producto-checkout-info"><p className="producto-checkout-nombre">{p.nombre}</p><small className="text-muted">Cantidad: {cantidad}</small></div><strong className="producto-checkout-precio">{formatearPrecio(p.precio * cantidad)}</strong></div>)}</div><hr/><div className="d-flex justify-content-between mb-2"><span>Subtotal</span><span>{formatearPrecio(subtotal)}</span></div><div className="d-flex justify-content-between mb-2 gap-2"><span>Envío</span><span className="text-muted text-end">{modalidad === "RETIRO_EN_TIENDA" ? "Según servicio" : "Calculado al confirmar"}</span></div><hr/><div className="d-flex justify-content-between align-items-center mb-4"><strong className="fs-5">Subtotal</strong><strong className="fs-4 precio-total">{formatearPrecio(subtotal)}</strong></div><button type="submit" form="formCheckout" className="btn btn-primary w-100 btn-lg" id="btnConfirmarCompra" disabled={enviando}>{enviando ? "Procesando pedido..." : "Confirmar compra"}</button><p className="text-muted text-center small mt-3 mb-0">🔒 Pago seguro simulado</p><p className="text-muted small text-center mt-2 mb-0">El total final incluirá el despacho calculado por el backend.</p></div></aside>
    </div>
  </div></main>;
}
