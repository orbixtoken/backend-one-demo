// src/routes/empresa.routes.js
import express from 'express';
import {
  buscarEmpresaConfig,
  atualizarEmpresaConfig
} from '../controllers/empresaController.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// somente autenticado
router.use(authMiddleware);

// somente ADMIN pode alterar
router.get('/', buscarEmpresaConfig);
router.put('/', roleMiddleware(['ADMIN']), atualizarEmpresaConfig);

export default router;
