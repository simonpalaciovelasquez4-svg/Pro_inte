import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { retosApi } from '../services/api.js';
import useCatalogos, { porId } from '../hooks/useCatalogos.js';
import RetoCard from '../components/RetoCard.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Cargando from '../components/Cargando.jsx';

const ESTADOS = ['Abierto', 'En revisión', 'Cerrado'];

export default function Dashboard() {
  const { empresas, categorias, prioridades, cargando: cargandoCat, error: errorCat } = useCatalogos();
  const [retos, setRetos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('todos');
  const [empresaId, setEmpresaId] = useState('todas');
  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const buscadorRef = useRef(null);

  useEffect(() => {
    document.title = 'Retos · Nexo Retos';
    retosApi.listar()
      .then(setRetos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  // Atajo de teclado: "/" enfoca el buscador.
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        buscadorRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const empresasPorId = useMemo(() => porId(empresas), [empresas]);
  const categoriasPorId = useMemo(() => porId(categorias), [categorias]);
  const prioridadesPorId = useMemo(() => porId(prioridades), [prioridades]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return retos.filter((r) => {
      const texto = `${r.nombre} ${r.descripcion}`.toLowerCase();
      return (
        (!q || texto.includes(q)) &&
        (estado === 'todos' || r.estado === estado) &&
        (empresaId === 'todas' || String(r.empresaId) === empresaId)
      );
    });
  }, [retos, busqueda, estado, empresaId]);

  const conteo = (e) => retos.filter((r) => r.estado === e).length;

  const confirmarEliminar = async () => {
    setEliminando(true);
    try {
      await retosApi.eliminar(aEliminar.id);
      setRetos((prev) => prev.filter((r) => r.id !== aEliminar.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setAEliminar(null);
      setEliminando(false);
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="h3 mb-0">Retos</h1>
          <small className="text-secondary">
            {conteo('Abierto')} abiertos · {conteo('En revisión')} en revisión · {conteo('Cerrado')} cerrados
          </small>
        </div>
        <Link to="/retos/nuevo" className="btn btn-primary">Publicar reto</Link>
      </div>

      <div className="row g-2 mb-4">
        <div className="col-md-6">
          <input
            ref={buscadorRef}
            className="form-control"
            placeholder='Buscar por nombre o descripción (atajo: "/")'
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="col-6 col-md-3">
          <select className="form-select" value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}>
            <option value="todas">Todas las empresas</option>
            {empresas.map((e) => <option key={e.id} value={String(e.id)}>{e.nombre}</option>)}
          </select>
        </div>
        <div className="col-6 col-md-3">
          <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            {ESTADOS.map((e) => <option key={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {(error || errorCat) && <div className="alert alert-danger">{error || errorCat}</div>}
      {(cargando || cargandoCat) && <Cargando />}

      {!cargando && filtrados.length === 0 && (
        <div className="text-center text-secondary py-5">
          {retos.length === 0
            ? <>Aún no hay retos. <Link to="/retos/nuevo">Publica el primero</Link>.</>
            : 'Ningún reto coincide con tu búsqueda.'}
        </div>
      )}

      <div className="row g-3">
        {filtrados.map((r) => (
          <div className="col-md-6 col-lg-4" key={r.id}>
            <RetoCard
              reto={r}
              empresa={empresasPorId[String(r.empresaId)]}
              categoria={categoriasPorId[String(r.categoriaId)]}
              prioridad={prioridadesPorId[String(r.prioridadId)]}
              onEliminar={setAEliminar}
            />
          </div>
        ))}
      </div>

      <ConfirmModal
        abierto={!!aEliminar}
        titulo="Eliminar reto"
        mensaje={<>¿Seguro que quieres eliminar <strong>{aEliminar?.nombre}</strong>? Esta acción no se puede deshacer.</>}
        textoConfirmar="Eliminar"
        cargando={eliminando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </>
  );
}
