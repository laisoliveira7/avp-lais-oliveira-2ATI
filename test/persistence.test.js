const { after, test } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');

const storage = path.join(os.tmpdir(), `hp-api-persistence-${process.pid}.sqlite`);
process.env.JWT_SECRET = 'teste-local-chave-segura-com-mais-de-32-caracteres';
process.env.DATABASE_URL = `sqlite:${storage}`;

const sequelize = require('../src/config/database');
const { Personagem } = require('../src/models');
let conexaoFechada = false;

after(async () => {
  if (!conexaoFechada) await sequelize.close();
  if (fs.existsSync(storage)) fs.unlinkSync(storage);
});

test('personagens continuam no SQLite após reabrir a conexão', async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  await Personagem.create({
    nome: 'Neville Longbottom',
    casa: 'Grifinória',
    especie: 'Humano',
    ocupacao: 'Professor de Herbologia'
  });
  await sequelize.close();
  conexaoFechada = true;

  const novaConexao = new Sequelize({ dialect: 'sqlite', storage, logging: false });
  try {
    const [resultado] = await novaConexao.query('SELECT nome FROM personagens LIMIT 1');
    assert.equal(resultado[0].nome, 'Neville Longbottom');
  } finally {
    await novaConexao.close();
  }
});
