// routes/auditoria.routes.js
import express from 'express';
import { listarAuditoria } from '../controllers/auditoriaController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listarAuditoria);

export default router;
