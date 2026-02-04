import pool from '../config/db.js';

export const createProduto = async (produto) => {
    const { nome, descricao, categoria, quantidade, valor_pago, valor_final, data_validade, alerta_validade_dias } = produto;
    const { rows } = await pool.query(
        `INSERT INTO produtos (nome, descricao, categoria, quantidade, valor_pago, valor_final, data_validade, alerta_validade_dias)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [nome, descricao, categoria, quantidade, valor_pago, valor_final, data_validade, alerta_validade_dias]
    );
    return rows[0];
};

export const getAllProdutos = async () => {
    const { rows } = await pool.query('SELECT * FROM produtos ORDER BY nome');
    return rows;
};

export const updateProduto = async (id, produto) => {
    const { nome, descricao, categoria, quantidade, valor_pago, valor_final, data_validade, alerta_validade_dias, ativo } = produto;
    const { rows } = await pool.query(
        `UPDATE produtos SET nome=$1, descricao=$2, categoria=$3, quantidade=$4, valor_pago=$5, valor_final=$6, data_validade=$7, alerta_validade_dias=$8, ativo=$9
         WHERE id=$10 RETURNING *`,
        [nome, descricao, categoria, quantidade, valor_pago, valor_final, data_validade, alerta_validade_dias, ativo, id]
    );
    return rows[0];
};
