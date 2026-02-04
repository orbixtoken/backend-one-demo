import pool from '../config/db.js';

export const findUsuarioByEmail = async (email) => {
    const { rows } = await pool.query(
        'SELECT * FROM usuarios WHERE email=$1 AND ativo=true',
        [email]
    );
    return rows[0];
};

export const createUsuario = async ({ nome, email, telefone, senha_hash, role }) => {
    const { rows } = await pool.query(
        `INSERT INTO usuarios (nome, email, telefone, senha_hash, role)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id, nome, email, telefone, role`,
        [nome, email, telefone, senha_hash, role]
    );
    return rows[0];
};

export const getAllUsuarios = async () => {
    const { rows } = await pool.query(
        'SELECT id, nome, email, telefone, role, ativo, criado_em FROM usuarios'
    );
    return rows;
};

export const updateUsuario = async (id, { nome, email, telefone, role, ativo }) => {
    const { rows } = await pool.query(
        `UPDATE usuarios SET nome=$1, email=$2, telefone=$3, role=$4, ativo=$5
         WHERE id=$6 RETURNING id, nome, email, telefone, role, ativo`,
        [nome, email, telefone, role, ativo, id]
    );
    return rows[0];
};
