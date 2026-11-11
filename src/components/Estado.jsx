// Muestra spinner / error mientras llegan los datos del backend.
export default function Estado({ cargando, error, onReintentar }) {
  if (cargando) {
    return (
      <div className="text-center py-5" role="status">
        <div className="spinner-border text-primary" />
        <p className="mt-2 text-muted">Cargando...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
        <span>{error}</span>
        {onReintentar && <button className="btn btn-sm btn-outline-danger" onClick={onReintentar}>Reintentar</button>}
      </div>
    );
  }
  return null;
}
