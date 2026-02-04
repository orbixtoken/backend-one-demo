import pool from '../config/db.js';

export const listarHistorico = async (req, res) => {
    const { cliente_id } = req.params;
    try {
        const { rows } = await pool.query(
            'SELECT * FROM historico_cliente WHERE cliente_id=$1 ORDER BY data_registro DESC',
            [cliente_id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao listar histórico' });
    }
};

export const criarHistorico = async (req, res) => {
    const { cliente_id, descricao, tipo } = req.body;

    if (!cliente_id || !descricao) return res.status(400).json({ message: 'Campos obrigatórios faltando' });

    try {
        const { rows } = await pool.query(
            'INSERT INTO historico_cliente (cliente_id, descricao, tipo) VALUES ($1,$2,$3) RETURNING *',
            [cliente_id, descricao, tipo || 'ordem']
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao criar histórico' });
    }
};
