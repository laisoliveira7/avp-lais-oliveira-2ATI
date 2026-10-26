const { Personagem } = require('../models');

const campos = ['nome', 'casa', 'especie', 'ocupacao'];
const tamanhos = { nome: 120, casa: 80, especie: 80, ocupacao: 120 };

function validarPersonagem(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Envie os dados do personagem em formato JSON.';
  }

  for (const campo of campos) {
    if (typeof body[campo] !== 'string' || !body[campo].trim()) {
      return `O campo ${campo} é obrigatório e deve ser um texto.`;
    }
    if (body[campo].trim().length > tamanhos[campo]) {
      return `O campo ${campo} excede o limite de ${tamanhos[campo]} caracteres.`;
    }
  }
  return null;
}

function validarId(id) {
  return /^\d+$/.test(id) && Number(id) > 0;
}

async function listar(req, res, next) {
  try {
    const personagens = await Personagem.findAll({ order: [['id', 'ASC']] });
    return res.json(personagens);
  } catch (error) {
    return next(error);
  }
}

async function buscarPorId(req, res, next) {
  if (!validarId(req.params.id)) {
    return res.status(400).json({ mensagem: 'O identificador deve ser um número inteiro positivo.' });
  }
  try {
    const personagem = await Personagem.findByPk(req.params.id);
    if (!personagem) {
      return res.status(404).json({ mensagem: 'Personagem não encontrado.' });
    }
    return res.json(personagem);
  } catch (error) {
    return next(error);
  }
}

async function criar(req, res, next) {
  const erroValidacao = validarPersonagem(req.body);
  if (erroValidacao) {
    return res.status(400).json({ mensagem: erroValidacao });
  }
  try {
    const personagem = await Personagem.create({
      ...Object.fromEntries(campos.map(campo => [campo, req.body[campo].trim()])),
      usuarioId: req.usuario.id
    });
    return res.status(201).json(personagem);
  } catch (error) {
    return next(error);
  }
}

async function atualizar(req, res, next) {
  if (!validarId(req.params.id)) {
    return res.status(400).json({ mensagem: 'O identificador deve ser um número inteiro positivo.' });
  }
  const erroValidacao = validarPersonagem(req.body);
  if (erroValidacao) {
    return res.status(400).json({ mensagem: erroValidacao });
  }
  try {
    const personagem = await Personagem.findByPk(req.params.id);
    if (!personagem) {
      return res.status(404).json({ mensagem: 'Personagem não encontrado.' });
    }
    await personagem.update(Object.fromEntries(
      campos.map(campo => [campo, req.body[campo].trim()])
    ));
    return res.json(personagem);
  } catch (error) {
    return next(error);
  }
}

async function excluir(req, res, next) {
  if (!validarId(req.params.id)) {
    return res.status(400).json({ mensagem: 'O identificador deve ser um número inteiro positivo.' });
  }
  try {
    const personagem = await Personagem.findByPk(req.params.id);
    if (!personagem) {
      return res.status(404).json({ mensagem: 'Personagem não encontrado.' });
    }
    await personagem.destroy();
    return res.json({ mensagem: 'Personagem excluído com sucesso.', personagem });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
