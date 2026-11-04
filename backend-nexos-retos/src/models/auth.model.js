import { randomUUID } from 'node:crypto'
import pool from '../config/database.js'

const userFields = 'id, nombre, correo, rol, estado'
const credentialUserFields = 'u.id, u.nombre, u.correo, u.rol, u.estado'

export async function createParticipant({ nombre, correo, passwordHash }) {
  const id = randomUUID()
  const now = new Date()
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute(
      'INSERT INTO usuarios (id, nombre, correo, rol, estado, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, nombre, correo, 'Participante', 'Activo', now, now],
    )
    await connection.execute(
      'INSERT INTO auth_credentials (userId, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
      [id, passwordHash, now, now],
    )
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
  return findUserById(id)
}

export async function findCredentialsByEmail(correo) {
  const [rows] = await pool.execute(
    `SELECT ${credentialUserFields}, c.passwordHash
     FROM usuarios u
     JOIN auth_credentials c ON c.userId = u.id
     WHERE u.correo = ?`,
    [correo],
  )
  return rows[0] ?? null
}

export async function findUserById(id) {
  const [rows] = await pool.execute(
    `SELECT ${userFields} FROM usuarios WHERE id = ?`,
    [id],
  )
  return rows[0] ?? null
}
