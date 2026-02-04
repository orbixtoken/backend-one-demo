import pool from '../config/db.js';

export const createOrdem = async (cliente_id, usuario_id, observacoes) => {
    const { rows } = await pool.query(
        'INSERT INTO ordens (cliente_id, usuario_id, observacoes) VALUES ($1,$2,$3) RETURNING *',
        [cliente_id, usuario_id, observacoes]
    );
    return rows[0];
};

export const getAllOrdens = async () => {
    const { rows } = await pool.query('SELECT * FROM ordens ORDER BY data_abertura DESC');
    return rows;
};

export const createOrdemItem = async (ordem_id, produto_id, quantidade, preco_unitario) => {
    const total = quantidade * preco_unitario;
    const { rows } = await pool.query(
        'INSERT INTO ordem_itens (ordem_id, produto_id, quantidade, preco_unitario, total) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [ordem_id, produto_id, quantidade, preco_unitario, total]
    );
    return rows[0];
};

export const updateEstoqueProduto = async (produto_id, quantidade) => {
    const { rows } = await pool.query(
        'UPDATE produtos SET quantidade = quantidade - $1 WHERE id=$2 RETURNING *',
        [quantidade, produto_id]
    );
    return rows[0];
};

export const updateValorTotalOrdem = async (ordem_id, valor_total) => {
    const { rows } = await pool.query(
        'UPDATE ordens SET valor_total=$1 WHERE id=$2 RETURNING *',
        [valor_total, ordem_id]
    );
    return rows[0];
};
