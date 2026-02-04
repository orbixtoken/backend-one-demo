import express from 'express';
import {
  criarProduto,
  listarProdutos,
  buscarProdutoPorId,
  atualizarProduto
} from '../controllers/produtosController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

/**
 * ============================
 * TODAS AS ROTAS EXIGEM LOGIN
 * ============================
 */
router.use(authMiddleware);

/**
 * ============================
 * CRIAR PRODUTO
 * Apenas ADMIN e GERENTE
 * ============================
 */
router.post(
  '/',
  roleMiddleware(['ADMIN', 'GERENTE']),
  criarProduto
);

/**
 * ============================
 * ATUALIZAR PRODUTO
 * Apenas ADMIN e GERENTE
 * ============================
 */
router.put(
  '/:id',
  roleMiddleware(['ADMIN', 'GERENTE']),
  atualizarProduto
);

/**
 * ============================
 * LISTAR PRODUTOS
 * Qualquer usuário autenticado
 * ============================
 */
router.get('/', listarProdutos);

/**
 * ============================
 * BUSCAR PRODUTO POR ID
 * (usado na criação da ordem)
 * ============================
 */
router.get('/:id', buscarProdutoPorId);

export default router;
