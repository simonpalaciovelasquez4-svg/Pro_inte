import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as authModel from '../models/auth.model.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function invalid(message) {
  const error = new Error(message)
  error.status = 400
  return error
}

function jwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('JWT_SECRET debe configurarse con al menos 32 caracteres.')
  }
  return secret
}

function validateRegistration(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw invalid('El cuerpo de la solicitud debe ser un objeto JSON.')
  }
  const unknown = Object.keys(body).filter(field => !['nombre', 'correo', 'contrasena'].includes(field))
  if (unknown.length) throw invalid(`Campos no permitidos: ${unknown.join(', ')}.`)

  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
  const correo = typeof body.correo === 'string' ? body.correo.trim().toLowerCase() : ''
  const contrasena = body.contrasena
  if (!nombre) throw invalid('El campo "nombre" es obligatorio.')
  if (!emailPattern.test(correo)) throw invalid('Ingresa un correo electrónico válido.')
  if (typeof contrasena !== 'string' || contrasena.length < 8 || Buffer.byteLength(contrasena) > 72) {
    throw invalid('La contraseña debe tener entre 8 y 72 bytes.')
  }
  return { nombre, correo, contrasena }
}

function createToken(user, secret) {
  const token = jwt.sign({ rol: user.rol }, secret, {
    subject: user.id,
    expiresIn: '1h',
  })
  return { token, tokenType: 'Bearer', expiresIn: 3600 }
}

export async function register(req, res) {
  const values = validateRegistration(req.body)
  const secret = jwtSecret()
  const passwordHash = await bcrypt.hash(values.contrasena, 12)
  const user = await authModel.createParticipant({
    nombre: values.nombre,
    correo: values.correo,
    passwordHash,
  })
  return res.status(201).json({ data: { user, ...createToken(user, secret) } })
}

export async function login(req, res) {
  const secret = jwtSecret()
  const { correo, contrasena } = req.body ?? {}
  if (typeof correo !== 'string' || typeof contrasena !== 'string') {
    throw invalid('Debes enviar "correo" y "contrasena".')
  }

  const credentials = await authModel.findCredentialsByEmail(correo.trim().toLowerCase())
  const passwordMatches = credentials
    ? await bcrypt.compare(contrasena, credentials.passwordHash)
    : false
  if (!credentials || !passwordMatches || credentials.estado !== 'Activo') {
    const error = new Error('Correo o contraseña incorrectos.')
    error.status = 401
    throw error
  }

  const user = {
    id: credentials.id,
    nombre: credentials.nombre,
    correo: credentials.correo,
    rol: credentials.rol,
    estado: credentials.estado,
  }
  return res.json({ data: { user, ...createToken(user, secret) } })
}

export async function me(req, res) {
  const user = await authModel.findUserById(req.auth.userId)
  if (!user || user.estado !== 'Activo') {
    const error = new Error('La sesión no es válida.')
    error.status = 401
    throw error
  }
  return res.json({ data: user })
}
