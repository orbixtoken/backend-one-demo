import express from 'express';
import * as ctrl from '../controllers/financeiroExtra.controller.js';

const router = express.Router();

// categorias
router.get('/categorias', ctrl.listarCategorias);
router.post('/categorias', ctrl.criarCategoria);
router.put('/categorias/:id', ctrl.atualizarCategoria);
router.delete('/categorias/:id', ctrl.removerCategoria);

// movimentações
router.get('/', ctrl.listarMovimentacoes);
router.post('/', ctrl.criarMovimentacao);
router.put('/:id', ctrl.atualizarMovimentacao);
router.delete('/:id', ctrl.removerMovimentacao);

export default router;
