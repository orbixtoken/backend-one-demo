import pool from '../config/db.js';

export const getHistoricoByCliente = async (cliente_id) => {
    const { rows } = await pool.query(
        'SELECT * FROM historico_cliente WHERE cliente_id=$1 ORDER BY data_registro DESC',
        [cliente_id]
    );
    return rows;
};

export const createHistorico = async (cliente_id, descricao, tipo='ordem') => {
    const { rows } = await pool.query(
        'INSERT INTO historico_cliente (cliente_id, descricao, tipo) VALUES ($1,$2,$3) RETURNING *',
        [cliente_id, descricao, tipo]
    );
    return rows[0];
};
