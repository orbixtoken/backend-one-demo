import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

/*
  ===============================
  ARGuz Tech – Neon First Strategy
  ===============================

  Prioridade:
  1) DATABASE_URL (produção / Neon / Render)
  2) Variáveis locais (fallback dev)
*/

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false // obrigatório Neon/Render
        }
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: false
      }
);

pool.on('connect', () => {
  console.log('🟢 PostgreSQL conectado');
});

pool.on('error', (err) => {
  console.error('🔴 Erro PostgreSQL:', err);
  process.exit(1);
});

export default pool;
