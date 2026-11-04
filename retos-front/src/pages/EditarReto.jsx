import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { retosApi, soloCampos, CAMPOS_RETO } from '../services/api.js';
import useCatalogos from '../hooks/useCatalogos.js';
import RetoForm from '../components/RetoForm.jsx';
import Cargando from '../components/Cargando.jsx';

export default function EditarReto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { empresas, categorias, prioridades, cargando: cargandoCat, error: errorCat } = useCatalogos();
  const [reto, setReto] = useState(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    document.title = 'Editar reto · Nexo Retos';
    retosApi.obtener(id)
      .then((r) => setReto({
        ...r,
        empresaId: String(r.empresaId ?? ''),
        categoriaId: String(r.categoriaId ?? ''),
        prioridadId: String(r.prioridadId ?? ''),
        fechaInicio: r.fechaInicio ? r.fechaInicio.slice(0, 10) : '',
        fechaFin: r.fechaFin ? r.fechaFin.slice(0, 10) : '',
      }))
      .catch((e) => setError(e.message));
  }, [id]);

  const guardar = async (datos) => {
    setEnviando(true);
    setError('');
    try {
      await retosApi.actualizar(id, soloCampos(datos, CAMPOS_RETO));
      navigate(`/retos/${id}`);
    } catch (e) {
      setError(e.message);
      setEnviando(false);
    }
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 className="h3 mb-4">Editar reto</h1>
      {(error || errorCat) && <div className="alert alert-danger">{error || errorCat}</div>}
      {(!reto || cargandoCat) && !error && <Cargando />}
      {reto && !cargandoCat && (
        <RetoForm
          inicial={reto} empresas={empresas} categorias={categorias} prioridades={prioridades}
          onSubmit={guardar} enviando={enviando} textoBoton="Guardar cambios"
        />
      )}
    </div>
  );
}
