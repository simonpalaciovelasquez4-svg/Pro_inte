import { Router } from 'express'
import * as controller from '../controllers/entities.controller.js'
import asyncHandler from '../middleware/asyncHandler.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()
const entities = ['empresas', 'categorias', 'prioridades', 'usuarios', 'retos', 'registros']

router.use(requireAuth)

router.get('/data', asyncHandler(controller.getAllData))
router.get('/:entity', asyncHandler((req, res) => {
  if (!entities.includes(req.params.entity)) return res.status(404).json({ error: { message: 'Entidad no encontrada.' } })
  return controller.list(req, res)
}))
router.get('/:entity/:id', asyncHandler((req, res) => {
  if (!entities.includes(req.params.entity)) return res.status(404).json({ error: { message: 'Entidad no encontrada.' } })
  return controller.get(req, res)
}))
router.post('/:entity', asyncHandler((req, res) => {
  if (!entities.includes(req.params.entity)) return res.status(404).json({ error: { message: 'Entidad no encontrada.' } })
  return controller.create(req, res)
}))
router.put('/:entity/:id', asyncHandler((req, res) => {
  if (!entities.includes(req.params.entity)) return res.status(404).json({ error: { message: 'Entidad no encontrada.' } })
  return controller.update(req, res)
}))
router.delete('/:entity/:id', asyncHandler((req, res) => {
  if (!entities.includes(req.params.entity)) return res.status(404).json({ error: { message: 'Entidad no encontrada.' } })
  return controller.remove(req, res)
}))

export default router
