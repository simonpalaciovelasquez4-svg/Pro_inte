import { Link } from 'react-router-dom';
import EstadoBadge from './EstadoBadge.jsx';

const fecha = (f) => (f ? f.slice(0, 10) : '—');

export default function RetoCard({ reto, empresa, categoria, prioridad, onEliminar }) {
  return (
    <div className="card h-100 reto-card">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
          <h5 className="card-title mb-0">
            <Link to={`/retos/${reto.id}`} className="text-decoration-none text-dark stretched-link">
              {reto.nombre}
            </Link>
          </h5>
          <EstadoBadge estado={reto.estado} />
        </div>
        <p className="card-text text-secondary line-clamp">{reto.descripcion}</p>
        <dl className="row small mb-0 mt-auto">
          <dt className="col-5 text-secondary fw-normal">Empresa</dt>
          <dd className="col-7 mb-1">{empresa?.nombre || '—'}</dd>
          <dt className="col-5 text-secondary fw-normal">Categoría</dt>
          <dd className="col-7 mb-1">{categoria?.nombre || '—'}</dd>
          <dt className="col-5 text-secondary fw-normal">Prioridad</dt>
          <dd className="col-7 mb-1">{prioridad?.nombre || '—'}</dd>
          <dt className="col-5 text-secondary fw-normal">Cierra</dt>
          <dd className="col-7 mb-0">{fecha(reto.fechaFin)}</dd>
        </dl>
      </div>
      <div className="card-footer bg-white d-flex gap-2" style={{ position: 'relative', zIndex: 2 }}>
        <Link to={`/retos/${reto.id}/editar`} className="btn btn-sm btn-outline-primary">Editar</Link>
        <button className="btn btn-sm btn-outline-danger" onClick={() => onEliminar(reto)}>Eliminar</button>
      </div>
    </div>
  );
}
