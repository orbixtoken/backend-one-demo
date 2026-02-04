import express from 'express';
import { listarHistorico, criarHistorico } from '../controllers/historicoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas rotas exigem autenticação
router.use(authMiddleware);

// Listar histórico do cliente
router.get('/:cliente_id', listarHistorico);

// Criar histórico (usuário/admin)
router.post('/', criarHistorico);

export default router;
