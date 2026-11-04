import { randomUUID } from 'node:crypto'
import pool from '../config/database.js'

export const entities = {
  empresas: ['nombre', 'nit', 'sector', 'contacto', 'correo', 'telefono'],
  categorias: ['nombre', 'descripcion'],
  prioridades: ['nombre', 'nivel'],
  usuarios: ['nombre', 'correo', 'rol', 'estado'],
  retos: ['nombre', 'descripcion', 'empresaId', 'categoriaId', 'prioridadId', 'fechaInicio', 'fechaFin', 'estado'],
  registros: ['usuarioId', 'retoId', 'fechaRegistro', 'observacion', 'estado'],
}

const optionalDefaults = {
  empresas: { telefono: '' },
  registros: { observacion: '' },
}

const tableFor = entity => {
  if (!Object.hasOwn(entities, entity)) {
    const error = new Error('Entidad no encontrada.')
    error.status = 404
    throw error
  }
  return `\`${entity}\``
}

export async function findAll(entity) {
  const table = tableFor(entity)
  const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY createdAt DESC`)
  return rows
}

export async function findById(entity, id) {
  const table = tableFor(entity)
  const [rows] = await pool.execute(`SELECT * FROM ${table} WHERE id = ?`, [id])
  return rows[0] ?? null
}

export async function create(entity, values) {
  const table = tableFor(entity)
  const fields = entities[entity].filter(field => values[field] !== undefined || optionalDefaults[entity]?.[field] !== undefined)
  const columns = ['id', ...fields, 'createdAt', 'updatedAt']
  const placeholders = columns.map(() => '?').join(', ')
  const now = new Date()
  const params = [randomUUID(), ...fields.map(field => values[field] ?? optionalDefaults[entity]?.[field]), now, now]
  await pool.execute(
    `INSERT INTO ${table} (${columns.map(column => `\`${column}\``).join(', ')}) VALUES (${placeholders})`,
    params,
  )
  return findById(entity, params[0])
}

export async function update(entity, id, values) {
  const table = tableFor(entity)
  const fields = entities[entity].filter(field => values[field] !== undefined || optionalDefaults[entity]?.[field] !== undefined)
  if (fields.length === 0) return findById(entity, id)

  const assignments = fields.map(field => `\`${field}\` = ?`).join(', ')
  await pool.execute(
    `UPDATE ${table} SET ${assignments}, updatedAt = ? WHERE id = ?`,
    [...fields.map(field => values[field] ?? optionalDefaults[entity]?.[field]), new Date(), id],
  )
  return findById(entity, id)
}

export async function remove(entity, id) {
  const table = tableFor(entity)
  const [result] = await pool.execute(`DELETE FROM ${table} WHERE id = ?`, [id])
  return result.affectedRows > 0
}
