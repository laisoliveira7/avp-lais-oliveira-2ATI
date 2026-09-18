const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());

// Banco de dados temporário em memória
let personagens = [
  {
    id: 1,
    nome: 'Harry Potter',
    casa: 'Grifinória',
    especie: 'Humano',
    ocupacao: 'Auror'
  }
];

// Rota inicial
app.get('/', (req, res) => {
  res.send('Servidor Express funcionando!');
});

// GET - listar todos os personagens
app.get('/personagens', (req, res) => {
  res.json(personagens);
});

// GET - buscar personagem por ID
app.get('/personagens/:id', (req, res) => {
  const id = Number(req.params.id);
  const personagem = personagens.find(p => p.id === id);

  if (!personagem) {
    return res.status(404).json({
      mensagem: 'Personagem não encontrado'
    });
  }

  res.json(personagem);
});

// POST - cadastrar personagem
app.post('/personagens', (req, res) => {
  const { nome, casa, especie, ocupacao } = req.body;

  if (!nome || !casa || !especie || !ocupacao) {
    return res.status(400).json({
      mensagem: 'Preencha todos os campos'
    });
  }

  const novoPersonagem = {
    id: personagens.length > 0
      ? Math.max(...personagens.map(p => p.id)) + 1
      : 1,
    nome,
    casa,
    especie,
    ocupacao
  };

  personagens.push(novoPersonagem);

  res.status(201).json(novoPersonagem);
});

// PUT - atualizar personagem
app.put('/personagens/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = personagens.findIndex(p => p.id === id);

  if (indice === -1) {
    return res.status(404).json({
      mensagem: 'Personagem não encontrado'
    });
  }

  const { nome, casa, especie, ocupacao } = req.body;

  if (!nome || !casa || !especie || !ocupacao) {
    return res.status(400).json({
      mensagem: 'Preencha todos os campos'
    });
  }

  personagens[indice] = {
    id,
    nome,
    casa,
    especie,
    ocupacao
  };

  res.json(personagens[indice]);
});

// DELETE - excluir personagem
app.delete('/personagens/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = personagens.findIndex(p => p.id === id);

  if (indice === -1) {
    return res.status(404).json({
      mensagem: 'Personagem não encontrado'
    });
  }

  const personagemRemovido = personagens.splice(indice, 1);

  res.json({
    mensagem: 'Personagem excluído com sucesso',
    personagem: personagemRemovido[0]
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});