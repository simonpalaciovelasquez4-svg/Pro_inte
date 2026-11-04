import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { retosApi, soloCampos, CAMPOS_RETO } from '../services/api.js';
import useCatalogos from '../hooks/useCatalogos.js';
import RetoForm from '../components/RetoForm.jsx';
import Cargando from '../components/Cargando.jsx';

export default function NuevoReto() {
  const navigate = useNavigate();
  const { empresas, categorias, prioridades, cargando, error: errorCat } = useCatalogos();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'Publicar reto · Nexo Retos'; }, []);

  const guardar = async (datos) => {
    setEnviando(true);
    setError('');
    try {
      const creado = await retosApi.crear(soloCampos(datos, CAMPOS_RETO));
      navigate(creado?.id ? `/retos/${creado.id}` : '/');
    } catch (e) {
      setError(e.message);
      setEnviando(false);
    }
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 className="h3 mb-4">Publicar reto</h1>
      {(error || errorCat) && <div className="alert alert-danger">{error || errorCat}</div>}
      {cargando ? <Cargando /> : (
        <RetoForm
          empresas={empresas} categorias={categorias} prioridades={prioridades}
          onSubmit={guardar} enviando={enviando} textoBoton="Publicar reto"
        />
      )}
    </div>
  );
}
