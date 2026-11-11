import { useState } from "react";
import { usuariosApi } from "../../api";
import Estado from "../../components/Estado";
import useAsync from "../../hooks/useAsync";
import { validarEmail } from "../../utils/validar";

// Los controladores actuales NO tienen endpoint para eliminar clientes ni crear administradores.
export default function UsuariosAdmin() {
  const { datos, cargando, error, recargar } = useAsync(() => usuariosApi.listarClientes(), []);
  const [editando, setEditando] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const iniciar = u => { setEditando({ id:u.id, nombre:u.nombres || u.nombre.split(" ")[0], apellido:u.apellido || u.nombre.split(" ").slice(1).join(" "), email:u.email, telefono:u.telefono, rut:u.rut }); setAviso(null); };
  const cambiar = e => setEditando({ ...editando, [e.target.name]:e.target.value });
  const guardar = async e => {
    e.preventDefault();
    if (!editando.nombre.trim() || !editando.apellido.trim() || !validarEmail(editando.email)) { setAviso({ tipo:"danger", texto:"Completa nombre, apellido y un correo válido." }); return; }
    setGuardando(true);
    try { await usuariosApi.actualizarCliente(editando.id, editando); setEditando(null); setAviso({ tipo:"success", texto:"Cliente actualizado correctamente." }); recargar(); }
    catch(err) { setAviso({ tipo:"danger", texto:err.message }); }
    finally { setGuardando(false); }
  };
  return <>
    <h1 className="h3 mb-3">Clientes registrados</h1>
    <p className="text-muted">Administra los datos de los clientes. El microservicio actual no ofrece eliminación de usuarios ni asignación de roles desde esta pantalla.</p>
    {aviso && <div className={`alert alert-${aviso.tipo}`} role="status">{aviso.texto}</div>}
    <Estado cargando={cargando} error={error} onReintentar={recargar} />
    {editando && <form className="card card-body mb-4" onSubmit={guardar}>
      <h2 className="h5">Editar cliente #{editando.id}</h2>
      <div className="row g-3">{[["nombre","Nombre"],["apellido","Apellido"],["email","Correo"],["telefono","Teléfono"]].map(([clave,etiqueta]) => <div className="col-md-6" key={clave}>
        <label className="form-label" htmlFor={`cli-${clave}`}>{etiqueta}</label><input className="form-control" id={`cli-${clave}`} name={clave} type={clave==="email"?"email":"text"} value={editando[clave]} onChange={cambiar} required={clave!=="telefono"}/>
      </div>)}</div>
      <p className="small text-muted mt-3 mb-2">RUT: {editando.rut} (el microservicio no permite cambiarlo).</p>
      <div><button className="btn btn-success me-2" disabled={guardando} type="submit">{guardando?"Guardando...":"Guardar cambios"}</button><button className="btn btn-outline-secondary" type="button" onClick={()=>setEditando(null)}>Cancelar</button></div>
    </form>}
    {datos && <div className="table-responsive"><table className="table table-striped align-middle">
      <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>RUT</th><th>Teléfono</th><th>Registro</th><th>Acciones</th></tr></thead>
      <tbody>{datos.map(u=><tr key={u.id}><td>{u.id}</td><td>{u.nombre}</td><td>{u.email}</td><td>{u.rut}</td><td>{u.telefono}</td>
        <td>{u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString("es-CL") : ""}</td><td><button className="btn btn-sm btn-warning" onClick={()=>iniciar(u)}>Editar</button></td>
      </tr>)}</tbody>
    </table></div>}
  </>;
}
