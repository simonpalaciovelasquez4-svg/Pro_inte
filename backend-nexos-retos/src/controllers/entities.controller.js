import * as entityModel from '../models/entities.model.js'

const allowedValues = {
  retos: { estado: ['Abierto', 'En revisión', 'Cerrado'] },
  usuarios: { rol: ['Participante', 'Evaluador', 'Administrador'], estado: ['Activo', 'Inactivo'] },
  registros: { estado: ['Pendiente', 'Aprobado', 'Rechazado'] },
}

const requiredFields = {
  empresas: ['nombre', 'nit', 'sector', 'contacto', 'correo'],
  categorias: ['nombre', 'descripcion'],
  prioridades: ['nombre', 'nivel'],
  usuarios: ['nombre', 'correo', 'rol', 'estado'],
  retos: ['nombre', 'descripcion', 'empresaId', 'categoriaId', 'prioridadId', 'fechaInicio', 'fechaFin', 'estado'],
  registros: ['usuarioId', 'retoId', 'fechaRegistro', 'estado'],
}

const optionalDefaults = {
  empresas: { telefono: '' },
  registros: { observacion: '' },
}

function validate(entity, body) {
  const fields = entityModel.entities[entity]
  if (!fields) {
    const error = new Error('Entidad no encontrada.')
    error.status = 404
    throw error
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('El cuerpo de la solicitud debe ser un objeto JSON.')
    error.status = 400
    throw error
  }

  const unknown = Object.keys(body).filter(field => !fields.includes(field))
  if (unknown.length) {
    const error = new Error(`Campos no permitidos: ${unknown.join(', ')}.`)
    error.status = 400
    throw error
  }

  const values = {}
  for (const field of fields) {
    if (body[field] === undefined) {
      if (requiredFields[entity].includes(field)) {
        const error = new Error(`El campo "${field}" es obligatorio.`)
        error.status = 400
        throw error
      }
      if (optionalDefaults[entity]?.[field] !== undefined) {
        values[field] = optionalDefaults[entity][field]
      }
      continue
    }

    const value = body[field]
    if (typeof value === 'string') {
      values[field] = value.trim()
      if (requiredFields[entity].includes(field) && !values[field]) {
        const error = new Error(`El campo "${field}" no puede estar vacío.`)
        error.status = 400
        throw error
      }
    } else if (entity === 'prioridades' && field === 'nivel') {
      const number = Number(value)
      if (!Number.isInteger(number) || number < 1) {
        const error = new Error('El nivel debe ser un número entero mayor que cero.')
        error.status = 400
        throw error
      }
      values[field] = number
    } else {
      const error = new Error(`El campo "${field}" debe ser texto.`)
      error.status = 400
      throw error
    }

    const choices = allowedValues[entity]?.[field]
    if (choices && !choices.includes(values[field])) {
      const error = new Error(`El valor de "${field}" no es válido.`)
      error.status = 400
      throw error
    }
  }

  for (const field of ['correo']) {
    if (values[field] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[field])) {
      const error = new Error('Ingresa un correo electrónico válido.')
      error.status = 400
      throw error
    }
  }

  for (const field of ['fechaInicio', 'fechaFin', 'fechaRegistro']) {
    const value = values[field]
    const date = value && new Date(`${value}T00:00:00.000Z`)
    if (value && (
      !/^\d{4}-\d{2}-\d{2}$/.test(value)
      || Number(value.slice(0, 4)) < 1000
      || Number.isNaN(date.getTime())
      || date.toISOString().slice(0, 10) !== value
    )) {
      const error = new Error(`El campo "${field}" debe tener formato YYYY-MM-DD.`)
      error.status = 400
      throw error
    }
  }

  if (entity === 'retos' && values.fechaInicio && values.fechaFin && values.fechaFin < values.fechaInicio) {
    const error = new Error('La fecha de cierre no puede ser anterior a la fecha de inicio.')
    error.status = 400
    throw error
  }
  return values
}

function forbidden(message) {
  const error = new Error(message)
  error.status = 403
  return error
}

export async function list(req, res) {
  res.json({ data: await entityModel.findAll(req.params.entity) })
}

export async function get(req, res) {
  const item = await entityModel.findById(req.params.entity, req.params.id)
  if (!item) return res.status(404).json({ error: { message: 'Registro no encontrado.' } })
  return res.json({ data: item })
}

export async function create(req, res) {
  const values = validate(req.params.entity, req.body)
  if (
    req.params.entity === 'usuarios'
    && req.auth.rol !== 'Administrador'
    && values.rol !== 'Participante'
  ) {
    throw forbidden('Solo un administrador puede asignar roles.')
  }
  const item = await entityModel.create(req.params.entity, values)
  return res.status(201).json({ data: item })
}

export async function update(req, res) {
  const values = validate(req.params.entity, req.body)
  if (req.params.entity === 'usuarios' && req.auth.rol !== 'Administrador') {
    const existing = await entityModel.findById('usuarios', req.params.id)
    if (!existing) return res.status(404).json({ error: { message: 'Registro no encontrado.' } })
    if (values.rol !== existing.rol) {
      throw forbidden('Solo un administrador puede cambiar roles.')
    }
  }
  const item = await entityModel.update(req.params.entity, req.params.id, values)
  if (!item) return res.status(404).json({ error: { message: 'Registro no encontrado.' } })
  return res.json({ data: item })
}

export async function remove(req, res) {
  if (req.params.entity === 'usuarios') {
    if (req.auth.rol !== 'Administrador') {
      throw forbidden('Solo un administrador puede eliminar usuarios.')
    }
    if (req.auth.userId === req.params.id) {
      throw forbidden('No puedes eliminar tu propia cuenta.')
    }
  }
  const removed = await entityModel.remove(req.params.entity, req.params.id)
  if (!removed) return res.status(404).json({ error: { message: 'Registro no encontrado.' } })
  return res.status(204).end()
}

export async function getAllData(_req, res) {
  const data = {}
  for (const entity of Object.keys(entityModel.entities)) {
    data[entity] = await entityModel.findAll(entity)
  }
  return res.json({ data })
}
