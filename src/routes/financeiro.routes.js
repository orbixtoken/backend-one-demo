import express from 'express'
import {
  listarMovimentos,
  listarMovimentosPorOrdem,
  resumoFinanceiro,
  criarEntradaManual,
  criarDespesaFinanceira
} from '../controllers/financeiroController.js'

import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', listarMovimentos)

router.get('/ordem/:ordem_id', listarMovimentosPorOrdem)

router.get('/resumo', resumoFinanceiro)

router.post('/entrada-manual', criarEntradaManual)

router.post('/despesa', criarDespesaFinanceira)

export default router