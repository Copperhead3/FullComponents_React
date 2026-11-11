import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validarEmail, validarRut, validarTelefono } from "../utils/validar";

const VACIO = { nombre: "", apellido: "", rut: "", telefono: "", email: "", password: "", confirmar: "" };

export default function Login() {
  const [modo, setModo] = useState("login");
  const [f, setF] = useState(VACIO);
  const [msg, setMsg] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const { login, registro } = useAuth();
  const navigate = useNavigate();

  const cambiar = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const error = (texto) => setMsg({ tipo: "danger", texto });

  const enviar = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!validarEmail(f.email)) return error("Ingresa un correo válido.");
    if (modo === "registro") {
      if (f.nombre.trim().length < 2 || f.apellido.trim().length < 2) return error("Nombre y apellido deben tener al menos 2 caracteres.");
      if (!validarRut(f.rut)) return error("RUT inválido.");
      if (f.telefono && !validarTelefono(f.telefono)) return error("Teléfono inválido (ej. 9 1234 5678).");
      if (f.password.length < 6) return error("La contraseña debe tener al menos 6 caracteres.");
      if (f.password !== f.confirmar) return error("Las contraseñas no coinciden.");
    }
    setEnviando(true);
    try {
      if (modo === "registro") {
        await registro({ nombre: f.nombre.trim(), apellido: f.apellido.trim(), rut: f.rut, telefono: f.telefono.trim(), email: f.email.trim(), password: f.password });
        setMsg({ tipo: "success", texto: "Cuenta creada. Ahora puedes iniciar sesión." });
        setModo("login");
        setF({ ...VACIO, email: f.email });
      } else {
        const u = await login(f.email.trim(), f.password);
        navigate(u.rol === "Administrador" ? "/admin" : "/");
      }
    } catch (err) {
      error(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const campo = (name, label, tipo = "text", col = "col-12") => (
    <div className={col}><label className="form-label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={tipo} className="form-control" value={f[name]} onChange={cambiar} /></div>
  );

  return (
    <main className="container py-5" style={{ maxWidth: 520 }}>
      <h1 className="h3 mb-4">{modo === "login" ? "Iniciar sesión" : "Crear cuenta"}</h1>
      {msg && <div className={`alert alert-${msg.tipo}`} role="alert">{msg.texto}</div>}
      <form onSubmit={enviar} noValidate className="row g-3">
        {modo === "registro" && (<>
          {campo("nombre", "Nombre", "text", "col-md-6")}{campo("apellido", "Apellido", "text", "col-md-6")}
          {campo("rut", "RUT (ej. 12.345.678-5)", "text", "col-md-6")}{campo("telefono", "Teléfono (opcional)", "text", "col-md-6")}
        </>)}
        {campo("email", "Correo", "email")}
        {campo("password", "Contraseña", "password")}
        {modo === "registro" && campo("confirmar", "Confirmar contraseña", "password")}
        <div className="col-12"><button className="btn btn-primary w-100" disabled={enviando}>{enviando ? "Procesando..." : modo === "login" ? "Ingresar" : "Registrarme"}</button></div>
      </form>
      <button className="btn btn-link mt-3" onClick={() => { setModo(modo === "login" ? "registro" : "login"); setMsg(null); }}>
        {modo === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </main>
  );
}
