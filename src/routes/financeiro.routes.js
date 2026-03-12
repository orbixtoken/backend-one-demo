import express from 'express'

import {
  listarMovimentos,
  listarMovimentosPorOrdem,
  resumoFinanceiro,
  criarEntradaManual,
  criarDespesaFinanceira,
  relatorioFinanceiro
} from '../controllers/financeiroController.js'

import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

// todas as rotas exigem autenticação
router.use(authMiddleware)

/**
 * ============================
 * LISTAR TODOS OS MOVIMENTOS
 * ============================
 */
router.get('/', listarMovimentos)

/**
 * ============================
 * MOVIMENTOS POR ORDEM
 * ============================
 */
router.get('/ordem/:ordem_id', listarMovimentosPorOrdem)

/**
 * ============================
 * RESUMO FINANCEIRO
 * ============================
 */
router.get('/resumo', resumoFinanceiro)

/**
 * ============================
 * RELATÓRIO FINANCEIRO
 * ============================
 */
router.get('/relatorio', relatorioFinanceiro)

/**
 * ============================
 * CRIAR ENTRADA MANUAL
 * ============================
 */
router.post('/entrada-manual', criarEntradaManual)

/**
 * ============================
 * CRIAR DESPESA
 * ============================
 */
router.post('/despesa', criarDespesaFinanceira)

export default router