const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const criarDocumentacao = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const personagemRoutes = require('./routes/personagemRoutes');
const { router: uploadRoutes, uploadDir } = require('./routes/uploadRoutes');
const { registrar, login } = require('./controllers/authController');

const app = express();
const porta = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadDir));

app.get('/', (req, res) => {
  res.json({ mensagem: 'API Harry Potter funcionando!', documentacao: '/api-docs' });
});
app.use('/auth', authRoutes);
// Caminhos antigos mantidos para compatibilidade com a versão anterior.
app.post('/usuarios', registrar);
app.post('/login', login);
app.use('/personagens', personagemRoutes);
app.use('/upload', uploadRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(criarDocumentacao(porta)));

app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ mensagem: 'O corpo da requisição deve conter JSON válido.' });
  }
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({ mensagem: 'Os dados enviados são inválidos.' });
  }
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ mensagem: 'Já existe um registro com esses dados.' });
  }
  if (error.name === 'MulterError') {
    return res.status(400).json({ mensagem: 'Arquivo inválido ou maior que o limite de 5 MB.' });
  }
  console.error('Erro interno da API:', error.message);
  return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
});

module.exports = app;
