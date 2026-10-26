const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

async function autenticarToken(req, res, next) {
  const authorization = req.get('Authorization');
  const [scheme, token, extra] = authorization ? authorization.split(' ') : [];

  if (scheme !== 'Bearer' || !token || extra) {
    return res.status(401).json({ mensagem: 'Token ausente ou formato inválido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(payload.sub);

    if (!usuario) {
      return res.status(401).json({ mensagem: 'Usuário do token não encontrado' });
    }

    req.usuario = usuario;
    return next();
  } catch (error) {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
  }
}

module.exports = autenticarToken;
