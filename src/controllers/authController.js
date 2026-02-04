import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'segredo';

export const login = async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ message: 'Email e senha são obrigatórios' });

    try {
        const { rows } = await pool.query('SELECT * FROM usuarios WHERE email=$1 AND ativo=true', [email]);
        const usuario = rows[0];
        if (!usuario) return res.status(401).json({ message: 'Credenciais inválidas' });

        const validSenha = await bcrypt.compare(senha, usuario.senha_hash);
        if (!validSenha) return res.status(401).json({ message: 'Credenciais inválidas' });

        const token = jwt.sign({ id: usuario.id, role: usuario.role }, JWT_SECRET, { expiresIn: '8h' });
        res.json({
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role,
                telefone: usuario.telefone
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
