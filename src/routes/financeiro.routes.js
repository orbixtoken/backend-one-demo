import express from 'express';
import {
  listarMovimentos,
  listarMovimentosPorOrdem,
  resumoFinanceiro
} from '../controllers/financeiroController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// todas exigem autenticação
router.use(authMiddleware);

// lista tudo
router.get('/', listarMovimentos);

// lista por ordem
router.get('/ordem/:ordem_id', listarMovimentosPorOrdem);

// resumo financeiro
router.get('/resumo', resumoFinanceiro);

export default router;
