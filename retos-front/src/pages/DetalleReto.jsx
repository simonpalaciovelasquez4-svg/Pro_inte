import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { retosApi, registrosApi, usuariosApi, soloCampos, CAMPOS_REGISTRO } from '../services/api.js';
import useCatalogos, { porId } from '../hooks/useCatalogos.js';
import EstadoBadge from '../components/EstadoBadge.jsx';
import Cargando from '../components/Cargando.jsx';

const fecha = (f) => (f ? f.slice(0, 10) : '—');

export default function DetalleReto() {
  const { id } = useParams();
  const { empresas, categorias, prioridades } = useCatalogos();
  const [reto, setReto] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    retosApi.obtener(id)
      .then((r) => { setReto(r); document.title = `${r.nombre} · Nexo Retos`; })
      .catch((e) => setError(e.message));

    Promise.all([registrosApi.listar(), usuariosApi.listar()])
      .then(([regs, usrs]) => {
        setRegistros(regs.filter((x) => String(x.retoId) === String(id)));
        setUsuarios(usrs);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const usuariosPorId = useMemo(() => porId(usuarios), [usuarios]);
  const empresa = porId(empresas)[String(reto?.empresaId)];
  const categoria = porId(categorias)[String(reto?.categoriaId)];
  const prioridad = porId(prioridades)[String(reto?.prioridadId)];

  const cambiarEstado = async (registro, nuevoEstado) => {
    try {
      // El backend usa PUT con el registro completo (si falta "observacion" la borra).
      const datos = soloCampos({ ...registro, estado: nuevoEstado }, CAMPOS_REGISTRO);
      await registrosApi.actualizar(registro.id, datos);
      setRegistros((prev) => prev.map((r) => (r.id === registro.id ? { ...r, estado: nuevoEstado } : r)));
    } catch (e) {
      setError(e.message);
    }
  };

  if (error && !reto) return <div className="alert alert-danger">{error}</div>;
  if (!reto) return <Cargando />;

  return (
    <>
      <Link to="/" className="text-decoration-none small">← Volver a los retos</Link>

      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mt-2 mb-3">
        <div>
          <h1 className="h3 mb-1">{reto.nombre}</h1>
          <EstadoBadge estado={reto.estado} />
        </div>
        <Link to={`/retos/${id}/editar`} className="btn btn-outline-primary">Editar reto</Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card card-body mb-4">
        <p style={{ whiteSpace: 'pre-line' }}>{reto.descripcion}</p>
        <dl className="row mb-0">
          <dt className="col-sm-3">Empresa</dt><dd className="col-sm-9">{empresa?.nombre || '—'}</dd>
          <dt className="col-sm-3">Categoría</dt><dd className="col-sm-9">{categoria?.nombre || '—'}</dd>
          <dt className="col-sm-3">Prioridad</dt><dd className="col-sm-9">{prioridad?.nombre || '—'}</dd>
          <dt className="col-sm-3">Inicio</dt><dd className="col-sm-9">{fecha(reto.fechaInicio)}</dd>
          <dt className="col-sm-3">Cierre</dt><dd className="col-sm-9 mb-0">{fecha(reto.fechaFin)}</dd>
        </dl>
      </div>

      <h2 className="h5 mb-3">Participantes registrados ({registros.length})</h2>
      {registros.length === 0 ? (
        <p className="text-secondary">Todavía nadie se ha registrado en este reto.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white">
            <thead>
              <tr><th>Participante</th><th>Registro</th><th>Estado</th><th>Observación</th><th className="text-end">Acciones</th></tr>
            </thead>
            <tbody>
              {registros.map((r) => {
                const u = usuariosPorId[String(r.usuarioId)];
                return (
                  <tr key={r.id}>
                    <td>{u?.nombre || `Usuario ${r.usuarioId}`}<div className="small text-secondary">{u?.correo}</div></td>
                    <td>{fecha(r.fechaRegistro)}</td>
                    <td><EstadoBadge estado={r.estado} /></td>
                    <td className="text-secondary small">{r.observacion || '—'}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-success me-1" disabled={r.estado === 'Aprobado'} onClick={() => cambiarEstado(r, 'Aprobado')}>Aprobar</button>
                      <button className="btn btn-sm btn-outline-danger" disabled={r.estado === 'Rechazado'} onClick={() => cambiarEstado(r, 'Rechazado')}>Rechazar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
