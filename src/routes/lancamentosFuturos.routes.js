import express from 'express'
import * as ctrl from '../controllers/lancamentosFuturos.controller.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', ctrl.listar)

router.post('/', ctrl.criar)

router.post('/:id/realizar', ctrl.realizar)

export default router