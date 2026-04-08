import dotenv from 'dotenv'
import pool from './src/config/db.js'
import app from './src/app.js'

dotenv.config()

const PORT = process.env.PORT

if (!PORT) {
  console.error('❌ PORT não definida no ambiente')
  process.exit(1)
}

async function start() {
  try {
    // Testa conexão com banco
    await pool.query('SELECT 1')
    console.log('🟢 Banco conectado')

    // Sobe servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`)
    })

  } catch (err) {
    console.error('❌ Falha ao iniciar servidor:', err)
    process.exit(1)
  }
}

// Tratamento de erros globais
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err)
})

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err)
})

start()