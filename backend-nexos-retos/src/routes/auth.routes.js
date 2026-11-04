import { Router } from 'express'
import * as controller from '../controllers/auth.controller.js'
import asyncHandler from '../middleware/asyncHandler.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()

router.post('/register', asyncHandler(controller.register))
router.post('/login', asyncHandler(controller.login))
router.get('/me', requireAuth, asyncHandler(controller.me))

export default router
