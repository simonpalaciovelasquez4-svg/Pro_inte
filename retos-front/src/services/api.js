// Único lugar donde se habla con el backend (Express + MySQL).
// El backend responde { data: ... } y los errores { error: { message } }.
const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && token) {
    window.dispatchEvent(new Event('auth:expired'));
  }

  if (!res.ok) {
    let mensaje = `Error ${res.status}`;
    try {
      const json = await res.json();
      mensaje = json?.error?.message || json?.message || mensaje;
    } catch {
      /* la respuesta no era JSON */
    }
    throw new Error(mensaje);
  }

  if (res.status === 204) return null;
  const json = await res.json();
  return json.data;
}

// El backend rechaza campos desconocidos y exige texto, así que solo enviamos
// los campos permitidos y convertimos los ids a string.
export function soloCampos(obj, campos) {
  const salida = {};
  for (const c of campos) {
    if (obj[c] === undefined || obj[c] === null) continue;
    salida[c] = typeof obj[c] === 'string' ? obj[c] : String(obj[c]);
  }
  return salida;
}

export const CAMPOS_RETO = ['nombre', 'descripcion', 'empresaId', 'categoriaId', 'prioridadId', 'fechaInicio', 'fechaFin', 'estado'];
export const CAMPOS_REGISTRO = ['usuarioId', 'retoId', 'fechaRegistro', 'estado', 'observacion'];

export const authApi = {
  login: (credenciales) => request('/auth/login', { method: 'POST', body: credenciales }),
  register: (datos) => request('/auth/register', { method: 'POST', body: datos }),
  me: () => request('/auth/me'),
};

const crud = (entidad) => ({
  listar: () => request(`/${entidad}`),
  obtener: (id) => request(`/${entidad}/${id}`),
  crear: (datos) => request(`/${entidad}`, { method: 'POST', body: datos }),
  actualizar: (id, datos) => request(`/${entidad}/${id}`, { method: 'PUT', body: datos }),
  eliminar: (id) => request(`/${entidad}/${id}`, { method: 'DELETE' }),
});

export const retosApi = crud('retos');
export const registrosApi = crud('registros');
export const empresasApi = crud('empresas');
export const categoriasApi = crud('categorias');
export const prioridadesApi = crud('prioridades');
export const usuariosApi = crud('usuarios');
