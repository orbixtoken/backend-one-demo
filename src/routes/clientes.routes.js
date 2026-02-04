import express from 'express';
import {
  criarCliente,
  listarClientes,
  buscarClientePorId,
  atualizarCliente,
  listarHistoricoCliente,
  listarHistoricoCompletoCliente
} from '../controllers/clientesController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// todas exigem autenticação
router.use(authMiddleware);

// CRUD
router.post('/', criarCliente);
router.get('/', listarClientes);

// ============================
// HISTÓRICOS (ANTES DO :id)
// ============================

// histórico administrativo
router.get('/:cliente_id/historico', listarHistoricoCliente);

// histórico completo (cadastro + ordens + financeiro)
router.get('/:id/historico-completo', listarHistoricoCompletoCliente);

// cliente individual
router.get('/:id', buscarClientePorId);
router.put('/:id', atualizarCliente);

export default router;
