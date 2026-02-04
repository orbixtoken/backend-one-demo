import dotenv from 'dotenv';
import pool from './src/config/db.js';
import app from './src/app.js';

dotenv.config();

const PORT = process.env.PORT || 3002;

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('🟢 Banco conectado');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Falha ao iniciar:', err);
    process.exit(1);
  }
}

start();
