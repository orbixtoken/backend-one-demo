import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

/* ================================
   CORS PROFISSIONAL
================================ */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://painel-one-nine.vercel.app',
  'https://painel-one.vercel.app',
  'https://muzel.vercel.app'
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    console.warn('⛔ CORS bloqueado:', origin)
    return callback(new Error('CORS não permitido'))
  },
  credentials: true
}))

// Permite preflight corretamente
app.options('*', cors())

app.use(express.json())

/* ================================
   HEALTH CHECK (ESSENCIAL PRO RENDER)
================================ */
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    sistema: 'Arguz One API',
    timestamp: new Date()
  })
})

/* ================================
   ROTAS
================================ */
import authRoutes from './routes/auth.routes.js'
import usuariosRoutes from './routes/usuarios.routes.js'
import produtosRoutes from './routes/produtos.routes.js'
import ordensRoutes from './routes/ordens.routes.js'
import historicoRoutes from './routes/historico.routes.js'
import auditoriaRoutes from './routes/auditoria.routes.js'
import financeiroRoutes from './routes/financeiro.routes.js'
import clientesRoutes from './routes/clientes.routes.js'
import orcamentosRoutes from './routes/orcamentos.routes.js'
import empresaRoutes from './routes/empresa.routes.js'
import financeiroExtraRoutes from './routes/financeiroExtra.routes.js'
import lancamentosFuturosRoutes from './routes/lancamentosFuturos.routes.js'

app.use('/api/auth', authRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/produtos', produtosRoutes)
app.use('/api/ordens', ordensRoutes)
app.use('/api/historico', historicoRoutes)
app.use('/api/auditoria', auditoriaRoutes)
app.use('/api/financeiro', financeiroRoutes)
app.use('/api/clientes', clientesRoutes)
app.use('/api/orcamentos', orcamentosRoutes)
app.use('/api/empresa', empresaRoutes)
app.use('/api/financeiro-extra', financeiroExtraRoutes)
app.use('/api/lancamentos-futuros', lancamentosFuturosRoutes)

/* ================================
   ROTA NÃO ENCONTRADA
================================ */
app.use((req, res) => {
  res.status(404).json({
    erro: 'Rota não encontrada'
  })
})

/* ================================
   ERRO GLOBAL
================================ */
app.use((err, req, res, next) => {
  console.error('❌ Erro interno:', err.message)

  res.status(500).json({
    erro: 'Erro interno do servidor'
  })
})

export default app