import { useEffect, useState } from 'react';
import { empresasApi, categoriasApi, prioridadesApi } from '../services/api.js';

// Carga empresas, categorías y prioridades (los selects y nombres de los retos).
export default function useCatalogos() {
  const [catalogos, setCatalogos] = useState({ empresas: [], categorias: [], prioridades: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([empresasApi.listar(), categoriasApi.listar(), prioridadesApi.listar()])
      .then(([empresas, categorias, prioridades]) => setCatalogos({ empresas, categorias, prioridades }))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  return { ...catalogos, cargando, error };
}

// Convierte una lista en un mapa { id: objeto } para buscar nombres rápido.
export const porId = (lista) => Object.fromEntries(lista.map((x) => [String(x.id), x]));
