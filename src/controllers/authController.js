const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarEmail(email) {
  return typeof email === 'string' && emailValido.test(email.trim());
}

async function registrar(req, res, next) {
  const { nome, email, senha } = req.body || {};
  const nomeNormalizado = typeof nome === 'string' ? nome.trim() : '';
  const emailNormalizado = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!nomeNormalizado || !emailNormalizado || typeof senha !== 'string') {
    return res.status(400).json({ mensagem: 'Informe nome, e-mail e senha.' });
  }
  if (nomeNormalizado.length > 120) {
    return res.status(400).json({ mensagem: 'O nome deve ter no máximo 120 caracteres.' });
  }
  if (!validarEmail(emailNormalizado)) {
    return res.status(400).json({ mensagem: 'Informe um e-mail válido.' });
  }
  if (senha.length < 8) {
    return res.status(400).json({ mensagem: 'A senha deve ter pelo menos 8 caracteres.' });
  }

  try {
    const existente = await Usuario.findOne({ where: { email: emailNormalizado } });
    if (existente) {
      return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
    }

    const usuario = await Usuario.create({
      nome: nomeNormalizado,
      email: emailNormalizado,
      senhaHash: senha
    });

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ mensagem: 'Este e-mail já está cadastrado.' });
    }
    return next(error);
  }
}

async function login(req, res, next) {
  const { email, senha } = req.body || {};
  const emailNormalizado = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!emailNormalizado || typeof senha !== 'string') {
    return res.status(400).json({ mensagem: 'Informe e-mail e senha.' });
  }
  if (!validarEmail(emailNormalizado)) {
    return res.status(400).json({ mensagem: 'Informe um e-mail válido.' });
  }

  try {
    const usuario = await Usuario.scope('withPasswordHash').findOne({
      where: { email: emailNormalizado }
    });
    if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign(
      { sub: String(usuario.id) },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.json({
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { registrar, login };
