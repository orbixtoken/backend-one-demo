import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// middlewares globais
app.use(cors());
app.use(express.json());

// rotas
import authRoutes from './routes/auth.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import produtosRoutes from './routes/produtos.routes.js';
import ordensRoutes from './routes/ordens.routes.js';
import historicoRoutes from './routes/historico.routes.js';
import auditoriaRoutes from './routes/auditoria.routes.js';
import financeiroRoutes from './routes/financeiro.routes.js';
import clientesRoutes from './routes/clientes.routes.js';
import orcamentosRoutes from './routes/orcamentos.routes.js';
import empresaRoutes from './routes/empresa.routes.js';
import financeiroExtraRoutes from './routes/financeiroExtra.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/ordens', ordensRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/auditoria', auditoriaRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/orcamentos', orcamentosRoutes);
app.use('/api/empresa', empresaRoutes);
app.use('/api/financeiro-extra', financeiroExtraRoutes);

export default app;
