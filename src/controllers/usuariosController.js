import pool from '../config/db.js';
import bcrypt from 'bcrypt';

/* =========================
   CRIAR USUÁRIO
========================= */
export const criarUsuario = async (req, res) => {
  const { nome, email, telefone, senha, role } = req.body;

  if (!nome || !email || !senha || !role) {
    return res.status(400).json({
      message: 'Campos obrigatórios faltando'
    });
  }

  try {
    const hash = await bcrypt.hash(senha, 10);

    const { rows } = await pool.query(
      `
      INSERT INTO usuarios
        (nome, email, telefone, senha_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nome, email, telefone, role, ativo, criado_em
      `,
      [nome, email, telefone || null, hash, role]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
};

/* =========================
   LISTAR USUÁRIOS
========================= */
export const listarUsuarios = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        id,
        nome,
        email,
        telefone,
        role,
        ativo,
        criado_em
      FROM usuarios
      ORDER BY nome ASC
      `
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
};

/* =========================
   ATUALIZAR USUÁRIO (PATCH REAL)
========================= */
export const atualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, role, ativo } = req.body;

  try {
    // 🔎 Busca dados atuais
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: 'Usuário não encontrado'
      });
    }

    const atual = rows[0];

    const { rows: atualizado } = await pool.query(
      `
      UPDATE usuarios
      SET
        nome = $1,
        email = $2,
        telefone = $3,
        role = $4,
        ativo = $5
      WHERE id = $6
      RETURNING id, nome, email, telefone, role, ativo
      `,
      [
        nome ?? atual.nome,
        email ?? atual.email,
        telefone ?? atual.telefone,
        role ?? atual.role,
        ativo ?? atual.ativo,
        id
      ]
    );

    res.json(atualizado[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
};
