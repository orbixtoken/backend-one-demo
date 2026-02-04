import express from 'express';
import { criarUsuario, listarUsuarios, atualizarUsuario } from '../controllers/usuariosController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Apenas admin pode gerenciar usuários
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

router.post('/', criarUsuario);
router.get('/', listarUsuarios);
router.put('/:id', atualizarUsuario);

export default router;
