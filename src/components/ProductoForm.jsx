import { useState } from "react";

const ESTADOS = ["BORRADOR", "PUBLICADO", "DESPUBLICADO"];

// Las especificaciones dependen de la categoría: cada categoría define sus atributos (DefinicionAtributo) en el backend.
export default function ProductoForm({ inicial = {}, categorias = [], onGuardar, onCancelar }) {
  const [f, setF] = useState({
    nombre: inicial.nombre ?? "", marca: inicial.marca ?? "", modelo: inicial.modelo ?? "", descripcion: inicial.descripcion ?? "",
    precio: inicial.precio ?? "", stockFisico: inicial.stockFisico ?? "", stockMinimo: inicial.stockMinimo ?? 0,
    imagen: inicial.imagen ?? "", categoriaId: inicial.categoriaId ?? "", estado: inicial.estado ?? "BORRADOR",
    garantiaMeses: inicial.garantia?.periodoMeses ?? "", condicionesGarantia: inicial.garantia?.condicionesGarantia ?? "",
    condicionesDespacho: inicial.informacionDespacho?.condicionesDespacho ?? "", plazoReferencial: inicial.informacionDespacho?.plazoReferencial ?? "",
  });
  const [valores, setValores] = useState(() => Object.fromEntries((inicial.atributos ?? []).map((a) => [String(a.idDefinicionAtributo), a.valor])));
  const [errores, setErrores] = useState({});

  const categoria = categorias.find((c) => String(c.id) === String(f.categoriaId));
  const cambiar = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const enviar = (e) => {
    e.preventDefault();
    const er = {};
    ["nombre", "marca", "modelo", "descripcion"].forEach((k) => { if (!String(f[k]).trim()) er[k] = "Campo obligatorio."; });
    if (!categoria) er.categoriaId = "Selecciona una categoría.";
    if (f.precio === "" || !(Number(f.precio) >= 0)) er.precio = "Ingresa un precio válido.";
    if (f.stockFisico === "" || !(Number.isInteger(Number(f.stockFisico)) && Number(f.stockFisico) >= 0)) er.stockFisico = "El stock debe ser un entero ≥ 0.";
    setErrores(er);
    if (Object.keys(er).length) return;
    onGuardar({
      ...inicial,
      nombre: f.nombre.trim(), marca: f.marca.trim(), modelo: f.modelo.trim(), descripcion: f.descripcion.trim(),
      precio: Number(f.precio), stockFisico: Number(f.stockFisico), stockMinimo: Number(f.stockMinimo) || 0,
      imagen: f.imagen.trim(), estado: f.estado, garantiaMeses: f.garantiaMeses,
      condicionesGarantia: f.condicionesGarantia, condicionesDespacho: f.condicionesDespacho, plazoReferencial: f.plazoReferencial,
      categoriaId: categoria.id, categoria: categoria.nombre,
      atributos: categoria.atributos.map((a) => ({ idDefinicionAtributo: a.id, valor: valores[String(a.id)] ?? "" })),
    });
  };

  const input = (name, label, extra = {}) => (
    <div className={extra.col ?? "col-md-6"}>
      <label className="form-label" htmlFor={`pf-${name}`}>{label}</label>
      <input id={`pf-${name}`} name={name} className={`form-control ${errores[name] ? "is-invalid" : ""}`} value={f[name]} onChange={cambiar} {...extra.input} />
      <div className="invalid-feedback">{errores[name]}</div>
    </div>
  );

  return (
    <form onSubmit={enviar} noValidate className="row g-3">
      {input("nombre", "Nombre", { col: "col-12" })}
      <div className="col-md-6">
        <label className="form-label" htmlFor="pf-categoriaId">Categoría</label>
        <select id="pf-categoriaId" name="categoriaId" className={`form-select ${errores.categoriaId ? "is-invalid" : ""}`} value={f.categoriaId} onChange={cambiar}>
          <option value="">Selecciona...</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <div className="invalid-feedback">{errores.categoriaId}</div>
      </div>
      <div className="col-md-6">
        <label className="form-label" htmlFor="pf-estado">Estado de publicación</label>
        <select id="pf-estado" name="estado" className="form-select" value={f.estado} onChange={cambiar}>{ESTADOS.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      {input("marca", "Marca")}{input("modelo", "Modelo")}
      {input("precio", "Precio (CLP)", { col: "col-md-4", input: { type: "number", min: 0 } })}
      {input("stockFisico", "Stock físico", { col: "col-md-4", input: { type: "number", min: 0 } })}
      {input("stockMinimo", "Stock mínimo (alerta)", { col: "col-md-4", input: { type: "number", min: 0 } })}
      {input("imagen", "Ruta o URL de imagen", { col: "col-12" })}
      {input("garantiaMeses", "Garantía (meses)", { col: "col-md-4", input: { type: "number", min: 0 } })}
      {input("condicionesGarantia", "Condiciones de garantía", { col: "col-md-8" })}
      {input("condicionesDespacho", "Condiciones de despacho")}
      {input("plazoReferencial", "Plazo referencial") }
      <div className="col-12">
        <label className="form-label" htmlFor="pf-descripcion">Descripción</label>
        <textarea id="pf-descripcion" name="descripcion" rows="2" className={`form-control ${errores.descripcion ? "is-invalid" : ""}`} value={f.descripcion} onChange={cambiar} />
        <div className="invalid-feedback">{errores.descripcion}</div>
      </div>
      {categoria && categoria.atributos.length > 0 && (
        <div className="col-12">
          <strong>Especificaciones de {categoria.nombre}</strong>
          <div className="row g-2 mt-1">
            {categoria.atributos.map((a) => (
              <div className="col-md-6" key={a.id}>
                <label className="form-label" htmlFor={`attr-${a.id}`}>{a.nombre}{a.unidad ? ` (${a.unidad})` : ""}</label>
                <input id={`attr-${a.id}`} className="form-control" value={valores[String(a.id)] ?? ""} onChange={(e) => setValores({ ...valores, [String(a.id)]: e.target.value })} />
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="col-12">
        <button className="btn btn-success me-2" type="submit">Guardar</button>
        <button className="btn btn-secondary" type="button" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
