import express from 'express';

import {
  criarOrdem,
  listarOrdens,
  buscarOrdemPorId,
  cancelarOrdem
} from '../controllers/ordensController.js';

import {
  abrirPdfOrdem,
  baixarPdfOrdem
} from '../controllers/ordensPdfController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

/**
 * ============================
 * TODAS ROTAS EXIGEM LOGIN
 * ============================
 */
router.use(authMiddleware);

/**
 * ============================
 * CRIAR ORDEM
 * ============================
 * Qualquer usuário autenticado
 */
router.post('/', criarOrdem);

/**
 * ============================
 * LISTAR ORDENS
 * ============================
 */
router.get('/', listarOrdens);

/**
 * ============================
 * BUSCAR ORDEM POR ID
 * ============================
 */
router.get('/:id', buscarOrdemPorId);

/**
 * ============================
 * PDF DA ORDEM
 * ============================
 */
router.get('/:id/pdf', abrirPdfOrdem);
router.get('/:id/pdf/download', baixarPdfOrdem);

/**
 * ============================
 * CANCELAR ORDEM
 * ============================
 * Apenas GERENTE ou ADMIN
 */
router.put(
  '/:id/cancelar',
  roleMiddleware(['GERENTE', 'ADMIN']),
  cancelarOrdem
);

export default router;
