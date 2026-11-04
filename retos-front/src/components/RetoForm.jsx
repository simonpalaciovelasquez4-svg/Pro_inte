import { useRef, useState } from 'react';

const VACIO = {
  nombre: '',
  descripcion: '',
  empresaId: '',
  categoriaId: '',
  prioridadId: '',
  fechaInicio: '',
  fechaFin: '',
  estado: 'Abierto',
};

const MAX_DESC = 600;
const ESTADOS = ['Abierto', 'En revisión', 'Cerrado'];

function validar(v) {
  const e = {};
  if (!v.nombre.trim()) e.nombre = 'Escribe el nombre del reto.';
  if (!v.descripcion.trim()) e.descripcion = 'Describe el reto.';
  if (!v.empresaId) e.empresaId = 'Elige la empresa.';
  if (!v.categoriaId) e.categoriaId = 'Elige una categoría.';
  if (!v.prioridadId) e.prioridadId = 'Elige una prioridad.';
  if (!v.fechaInicio) e.fechaInicio = 'Elige la fecha de inicio.';
  if (!v.fechaFin) e.fechaFin = 'Elige la fecha de cierre.';
  else if (v.fechaInicio && v.fechaFin < v.fechaInicio) e.fechaFin = 'La fecha de cierre no puede ser anterior al inicio.';
  return e;
}

export default function RetoForm({ inicial, empresas, categorias, prioridades, onSubmit, enviando, textoBoton }) {
  const [valores, setValores] = useState({ ...VACIO, ...inicial });
  const [errores, setErrores] = useState({});
  const formRef = useRef(null);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setValores((v) => ({ ...v, [name]: value }));
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: undefined }));
  };

  const enviar = (e) => {
    e.preventDefault();
    const nuevos = validar(valores);
    setErrores(nuevos);

    const primerCampo = Object.keys(nuevos)[0];
    if (primerCampo) {
      // Manipulación directa del DOM: lleva el foco al primer campo con error.
      formRef.current.querySelector(`[name="${primerCampo}"]`)?.focus();
      return;
    }
    onSubmit({ ...valores, nombre: valores.nombre.trim(), descripcion: valores.descripcion.trim() });
  };

  const clase = (campo, base = 'form-control') => `${base} ${errores[campo] ? 'is-invalid' : ''}`;

  const select = (campo, etiqueta, lista) => (
    <div className="col-md-4 mb-3">
      <label htmlFor={campo} className="form-label">{etiqueta}</label>
      <select id={campo} name={campo} className={clase(campo, 'form-select')} value={valores[campo]} onChange={cambiar}>
        <option value="">Selecciona…</option>
        {lista.map((x) => <option key={x.id} value={String(x.id)}>{x.nombre}</option>)}
      </select>
      <div className="invalid-feedback">{errores[campo]}</div>
    </div>
  );

  return (
    <form ref={formRef} onSubmit={enviar} noValidate>
      <div className="mb-3">
        <label htmlFor="nombre" className="form-label">Nombre del reto</label>
        <input id="nombre" name="nombre" className={clase('nombre')} value={valores.nombre} onChange={cambiar} />
        <div className="invalid-feedback">{errores.nombre}</div>
      </div>

      <div className="mb-3">
        <label htmlFor="descripcion" className="form-label">Descripción</label>
        <textarea
          id="descripcion" name="descripcion" rows="5" maxLength={MAX_DESC}
          className={clase('descripcion')} value={valores.descripcion} onChange={cambiar}
        />
        <div className="d-flex justify-content-between">
          <div className="invalid-feedback d-block">{errores.descripcion}</div>
          <small className="text-secondary ms-auto">{valores.descripcion.length}/{MAX_DESC}</small>
        </div>
      </div>

      <div className="row">
        {select('empresaId', 'Empresa', empresas)}
        {select('categoriaId', 'Categoría', categorias)}
        {select('prioridadId', 'Prioridad', prioridades)}
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <label htmlFor="fechaInicio" className="form-label">Fecha de inicio</label>
          <input id="fechaInicio" name="fechaInicio" type="date" className={clase('fechaInicio')} value={valores.fechaInicio} onChange={cambiar} />
          <div className="invalid-feedback">{errores.fechaInicio}</div>
        </div>
        <div className="col-md-4 mb-3">
          <label htmlFor="fechaFin" className="form-label">Fecha de cierre</label>
          <input id="fechaFin" name="fechaFin" type="date" className={clase('fechaFin')} value={valores.fechaFin} onChange={cambiar} />
          <div className="invalid-feedback">{errores.fechaFin}</div>
        </div>
        <div className="col-md-4 mb-3">
          <label htmlFor="estado" className="form-label">Estado</label>
          <select id="estado" name="estado" className="form-select" value={valores.estado} onChange={cambiar}>
            {ESTADOS.map((e) => <option key={e}>{e}</option>)}
          </select>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={enviando}>
        {enviando ? 'Guardando…' : textoBoton}
      </button>
    </form>
  );
}
