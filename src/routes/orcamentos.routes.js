import express from 'express';
import {
  criarOrcamento,
  listarOrcamentos,
  buscarOrcamento,
  cancelarOrcamento
} from '../controllers/orcamentosController.js';

import {
  abrirPdfOrcamento,
  baixarPdfOrcamento
} from '../controllers/orcamentosPdfController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// CRUD
router.post('/', criarOrcamento);
router.get('/', listarOrcamentos);
router.get('/:id', buscarOrcamento);
router.put('/:id/cancelar', cancelarOrcamento);

// PDF
router.get('/:id/pdf', abrirPdfOrcamento);
router.get('/:id/pdf/download', baixarPdfOrcamento);

export default router;
