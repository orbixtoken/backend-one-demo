import express from 'express'
import * as ctrl from '../controllers/lancamentosFuturos.controller.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

/* =========================
   MIDDLEWARE
========================= */

router.use(authMiddleware)


/* =========================
   ROTAS
========================= */

// Listar lançamentos
router.get('/', ctrl.listar)

// Criar lançamento
router.post('/', ctrl.criar)

// Realizar (pago / recebido)
router.post('/:id/realizar', ctrl.realizar)

// Deletar lançamento
router.delete('/:id', ctrl.deletar)


export default router