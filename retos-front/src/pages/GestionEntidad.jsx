import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CAMPOS_REGISTRO,
  categoriasApi,
  empresasApi,
  prioridadesApi,
  registrosApi,
  retosApi,
  soloCampos,
  usuariosApi,
} from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Cargando from '../components/Cargando.jsx';

const fechaHoy = () => {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
};

const ENTIDADES = {
  empresas: {
    titulo: 'Empresas',
    singular: 'empresa',
    api: empresasApi,
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
      { nombre: 'nit', etiqueta: 'NIT', requerido: true },
      { nombre: 'sector', etiqueta: 'Sector', requerido: true },
      { nombre: 'contacto', etiqueta: 'Contacto', requerido: true },
      { nombre: 'correo', etiqueta: 'Correo', tipo: 'email', requerido: true },
      { nombre: 'telefono', etiqueta: 'Teléfono' },
    ],
    columnas: [
      { nombre: 'nombre', etiqueta: 'Nombre' },
      { nombre: 'nit', etiqueta: 'NIT' },
      { nombre: 'sector', etiqueta: 'Sector' },
      { nombre: 'contacto', etiqueta: 'Contacto' },
      { nombre: 'correo', etiqueta: 'Correo' },
      { nombre: 'telefono', etiqueta: 'Teléfono' },
    ],
    camposApi: ['nombre', 'nit', 'sector', 'contacto', 'correo', 'telefono'],
  },
  categorias: {
    titulo: 'Categorías',
    singular: 'categoría',
    api: categoriasApi,
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
      { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'textarea', requerido: true },
    ],
    columnas: [
      { nombre: 'nombre', etiqueta: 'Nombre' },
      { nombre: 'descripcion', etiqueta: 'Descripción' },
    ],
    camposApi: ['nombre', 'descripcion'],
  },
  prioridades: {
    titulo: 'Prioridades',
    singular: 'prioridad',
    api: prioridadesApi,
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
      { nombre: 'nivel', etiqueta: 'Nivel', tipo: 'number', min: 1, step: 1, requerido: true },
    ],
    columnas: [
      { nombre: 'nombre', etiqueta: 'Nombre' },
      { nombre: 'nivel', etiqueta: 'Nivel' },
    ],
    camposApi: ['nombre', 'nivel'],
  },
  usuarios: {
    titulo: 'Usuarios',
    singular: 'usuario',
    api: usuariosApi,
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre', requerido: true },
      { nombre: 'correo', etiqueta: 'Correo', tipo: 'email', requerido: true },
      { nombre: 'rol', etiqueta: 'Rol', tipo: 'select', opciones: ['Participante', 'Evaluador', 'Administrador'], requerido: true },
      { nombre: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: ['Activo', 'Inactivo'], requerido: true },
    ],
    columnas: [
      { nombre: 'nombre', etiqueta: 'Nombre' },
      { nombre: 'correo', etiqueta: 'Correo' },
      { nombre: 'rol', etiqueta: 'Rol' },
      { nombre: 'estado', etiqueta: 'Estado' },
    ],
    camposApi: ['nombre', 'correo', 'rol', 'estado'],
  },
  registros: {
    titulo: 'Inscripciones',
    singular: 'inscripción',
    api: registrosApi,
    campos: [
      { nombre: 'usuarioId', etiqueta: 'Participante', tipo: 'usuario', requerido: true },
      { nombre: 'retoId', etiqueta: 'Reto', tipo: 'reto', requerido: true },
      { nombre: 'fechaRegistro', etiqueta: 'Fecha de registro', tipo: 'date', requerido: true },
      { nombre: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: ['Pendiente', 'Aprobado', 'Rechazado'], requerido: true },
      { nombre: 'observacion', etiqueta: 'Observación', tipo: 'textarea' },
    ],
    columnas: [
      { nombre: 'usuarioId', etiqueta: 'Participante', relacion: 'usuario' },
      { nombre: 'retoId', etiqueta: 'Reto', relacion: 'reto' },
      { nombre: 'fechaRegistro', etiqueta: 'Fecha' },
      { nombre: 'estado', etiqueta: 'Estado' },
      { nombre: 'observacion', etiqueta: 'Observación' },
    ],
    camposApi: CAMPOS_REGISTRO,
  },
};

const VALORES_INICIALES = {
  usuarioId: '',
  retoId: '',
  estado: 'Pendiente',
  observacion: '',
};

function mostrarFecha(valor) {
  return valor ? String(valor).slice(0, 10) : '—';
}

export default function GestionEntidad() {
  const { recurso } = useParams();
  const { usuario: usuarioActual } = useAuth();
  const entidad = ENTIDADES[recurso];
  const esAdministrador = usuarioActual?.rol === 'Administrador';
  const [elementos, setElementos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [retos, setRetos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [formulario, setFormulario] = useState(null);
  const [eliminar, setEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      if (recurso === 'registros') {
        const [lista, listaUsuarios, listaRetos] = await Promise.all([
          registrosApi.listar(),
          usuariosApi.listar(),
          retosApi.listar(),
        ]);
        setElementos(lista);
        setUsuarios(listaUsuarios);
        setRetos(listaRetos);
      } else {
        setElementos(await entidad.api.listar());
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [entidad, recurso]);

  useEffect(() => {
    document.title = `${entidad?.titulo || 'Gestión'} · Nexo Retos`;
    if (entidad) cargar();
  }, [entidad, cargar]);

  const usuariosPorId = useMemo(
    () => Object.fromEntries(usuarios.map((usuario) => [String(usuario.id), usuario])),
    [usuarios]
  );
  const retosPorId = useMemo(
    () => Object.fromEntries(retos.map((reto) => [String(reto.id), reto])),
    [retos]
  );

  const iniciarNuevo = () => {
    const valores = Object.fromEntries(
      entidad.campos.map(({ nombre }) => [
        nombre,
        nombre === 'fechaRegistro' ? fechaHoy() : VALORES_INICIALES[nombre] ?? '',
      ])
    );
    if (recurso === 'usuarios' && !esAdministrador) {
      valores.rol = 'Participante';
      valores.estado = 'Activo';
    }
    setFormulario({
      id: null,
      valores,
    });
    setError('');
  };

  const iniciarEdicion = (elemento) => {
    const valores = Object.fromEntries(
      entidad.campos.map(({ nombre }) => [nombre, elemento[nombre] ?? ''])
    );
    if (valores.fechaRegistro) valores.fechaRegistro = mostrarFecha(valores.fechaRegistro);
    setFormulario({ id: elemento.id, valores });
    setError('');
  };

  const cambiarCampo = (e) => {
    const { name, value } = e.target;
    setFormulario((actual) => ({
      ...actual,
      valores: { ...actual.valores, [name]: value },
    }));
  };

  const guardar = async (e) => {
    e.preventDefault();
    const valores = { ...formulario.valores };
    const datos = soloCampos(valores, entidad.camposApi);
    if (recurso === 'prioridades') datos.nivel = Number(valores.nivel);

    setGuardando(true);
    setError('');
    try {
      if (formulario.id) await entidad.api.actualizar(formulario.id, datos);
      else await entidad.api.crear(datos);
      setFormulario(null);
      await cargar();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async () => {
    setEliminando(true);
    setError('');
    try {
      await entidad.api.eliminar(eliminar.id);
      setEliminar(null);
      await cargar();
    } catch (e) {
      setError(e.message);
      setEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  const resolverValor = (elemento, columna) => {
    const valor = elemento[columna.nombre];
    if (columna.relacion === 'usuario') {
      return usuariosPorId[String(valor)]?.nombre || `Usuario ${valor ?? '—'}`;
    }
    if (columna.relacion === 'reto') {
      return retosPorId[String(valor)]?.nombre || `Reto ${valor ?? '—'}`;
    }
    if (columna.nombre === 'fechaRegistro') return mostrarFecha(valor);
    return valor || '—';
  };

  if (!entidad) {
    return (
      <div className="alert alert-warning">
        Ese módulo no existe. <Link to="/">Volver a retos</Link>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <Link to="/" className="text-decoration-none small">← Volver a retos</Link>
          <h1 className="h3 mb-0 mt-1">{entidad.titulo}</h1>
        </div>
        <button className="btn btn-primary" onClick={iniciarNuevo}>
          Crear {entidad.singular}
        </button>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {recurso === 'usuarios' && (
        <div className="alert alert-info">
          El alta desde este módulo crea el perfil sin contraseña; para iniciar sesión, la persona debe registrarse desde la página de acceso.
          {!esAdministrador && ' Solo un administrador puede cambiar roles o eliminar cuentas.'}
        </div>
      )}

      {formulario && (
        <form className="card card-body mb-4" onSubmit={guardar}>
          <h2 className="h5 mb-3">{formulario.id ? `Editar ${entidad.singular}` : `Crear ${entidad.singular}`}</h2>
          <div className="row">
            {entidad.campos.map((campo) => {
              const requerido = campo.requerido || (!formulario.id && campo.requeridoAlCrear);
              const valor = formulario.valores[campo.nombre] ?? '';
              const restringido = recurso === 'usuarios'
                && !esAdministrador
                && campo.nombre === 'rol';
              return (
                <div
                  className={campo.tipo === 'textarea' ? 'col-12 mb-3' : 'col-md-6 mb-3'}
                  key={campo.nombre}
                >
                  <label htmlFor={`campo-${campo.nombre}`} className="form-label">{campo.etiqueta}</label>
                  {campo.tipo === 'select' ? (
                    <select
                      id={`campo-${campo.nombre}`}
                      name={campo.nombre}
                      className="form-select"
                      value={valor}
                      onChange={cambiarCampo}
                      required={requerido}
                      disabled={restringido}
                    >
                      <option value="">Selecciona…</option>
                      {campo.opciones.map((opcion) => <option key={opcion}>{opcion}</option>)}
                    </select>
                  ) : campo.tipo === 'usuario' || campo.tipo === 'reto' ? (
                    <select
                      id={`campo-${campo.nombre}`}
                      name={campo.nombre}
                      className="form-select"
                      value={valor}
                      onChange={cambiarCampo}
                      required={requerido}
                      disabled={restringido}
                    >
                      <option value="">Selecciona…</option>
                      {(campo.tipo === 'usuario' ? usuarios : retos).map((opcion) => (
                        <option key={opcion.id} value={String(opcion.id)}>
                          {opcion.nombre}
                        </option>
                      ))}
                    </select>
                  ) : campo.tipo === 'textarea' ? (
                    <textarea
                      id={`campo-${campo.nombre}`}
                      name={campo.nombre}
                      className="form-control"
                      value={valor}
                      onChange={cambiarCampo}
                      rows="3"
                      required={requerido}
                      disabled={restringido}
                    />
                  ) : (
                    <input
                      id={`campo-${campo.nombre}`}
                      name={campo.nombre}
                      type={campo.tipo || 'text'}
                      className="form-control"
                      value={valor}
                      onChange={cambiarCampo}
                      min={campo.min}
                      step={campo.step}
                      required={requerido}
                      disabled={restringido}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setFormulario(null)} disabled={guardando}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {cargando ? <Cargando /> : elementos.length === 0 ? (
        <div className="card card-body text-center text-secondary py-5">
          Todavía no hay {entidad.titulo.toLowerCase()}.
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  {entidad.columnas.map((columna) => <th key={columna.nombre}>{columna.etiqueta}</th>)}
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {elementos.map((elemento) => (
                  <tr key={elemento.id}>
                    {entidad.columnas.map((columna) => (
                      <td key={columna.nombre}>{resolverValor(elemento, columna)}</td>
                    ))}
                    <td className="text-end text-nowrap">
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => iniciarEdicion(elemento)}>
                        Editar
                      </button>
                      {(recurso !== 'usuarios' || (esAdministrador && String(elemento.id) !== String(usuarioActual?.id))) && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setEliminar(elemento)}>
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        abierto={!!eliminar}
        titulo={`Eliminar ${entidad.singular}`}
        mensaje={<>¿Seguro que quieres eliminar <strong>{eliminar?.nombre || entidad.singular}</strong>? Esta acción no se puede deshacer.</>}
        textoConfirmar="Eliminar"
        cargando={eliminando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setEliminar(null)}
      />
    </>
  );
}
