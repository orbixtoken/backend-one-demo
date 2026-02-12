import * as service from '../services/financeiroExtra.service.js';

export async function listarCategorias(req, res) {
  const data = await service.listarCategorias();
  res.json(data);
}

export async function criarCategoria(req, res) {
  const data = await service.criarCategoria(req.body);
  res.json(data);
}

export async function atualizarCategoria(req, res) {
  const data = await service.atualizarCategoria(
    req.params.id,
    req.body
  );
  res.json(data);
}

export async function removerCategoria(req, res) {
  await service.removerCategoria(req.params.id);
  res.json({ ok: true });
}

export async function listarMovimentacoes(req, res) {
  const data = await service.listarMovimentacoes(req.query);
  res.json(data);
}

export async function criarMovimentacao(req, res) {
  const data = await service.criarMovimentacao(req.body);
  res.json(data);
}

export async function atualizarMovimentacao(req, res) {
  const data = await service.atualizarMovimentacao(
    req.params.id,
    req.body
  );
  res.json(data);
}

export async function removerMovimentacao(req, res) {
  await service.removerMovimentacao(req.params.id);
  res.json({ ok: true });
}
