// src/controllers/empresaController.js
import pool from '../config/db.js';

/**
 * ============================
 * BUSCAR CONFIGURAÇÃO DA EMPRESA
 * ============================
 */
export const buscarEmpresaConfig = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT *
      FROM empresa_config
      WHERE ativo = true
      ORDER BY id DESC
      LIMIT 1
    `);

    if (!rows.length) {
      return res.status(404).json({
        message: 'Configuração da empresa não encontrada'
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar empresa_config:', err);
    res.status(500).json({ message: 'Erro ao buscar configuração da empresa' });
  }
};

/**
 * ============================
 * ATUALIZAR CONFIGURAÇÃO DA EMPRESA
 * ============================
 */
export const atualizarEmpresaConfig = async (req, res) => {
  const {
    nome,
    telefone,
    whatsapp,
    endereco,
    mensagem_orcamento,
    observacoes
  } = req.body;

  if (!nome) {
    return res.status(400).json({ message: 'Nome da empresa é obrigatório' });
  }

  try {
    const { rows } = await pool.query(`
      UPDATE empresa_config
      SET
        nome = $1,
        telefone = $2,
        whatsapp = $3,
        endereco = $4,
        mensagem_orcamento = $5,
        observacoes = $6,
        atualizado_em = NOW()
      WHERE ativo = true
      RETURNING *
    `, [
      nome,
      telefone || null,
      whatsapp || null,
      endereco || null,
      mensagem_orcamento || null,
      observacoes || null
    ]);

    if (!rows.length) {
      return res.status(404).json({
        message: 'Nenhuma configuração ativa encontrada'
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar empresa_config:', err);
    res.status(500).json({ message: 'Erro ao atualizar configuração da empresa' });
  }
};
