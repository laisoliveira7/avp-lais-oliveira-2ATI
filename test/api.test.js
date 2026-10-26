const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.JWT_SECRET = 'teste-local-chave-segura-com-mais-de-32-caracteres';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DATABASE_URL = 'sqlite::memory:';

const app = require('../src/app');
const sequelize = require('../src/config/database');
require('../src/models');

let token;
let personagemId;
const emailTeste = `aluno-${Date.now()}@hogwarts.com`;

before(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});

after(async () => {
  await sequelize.close();
});

test('cadastro, duplicidade e validação de usuário', async () => {
  const invalido = await request(app).post('/auth/register').send({
    nome: 'Hermione', email: 'email-invalido', senha: 'senha1234'
  });
  assert.equal(invalido.status, 400);

  const cadastro = await request(app).post('/auth/register').send({
    nome: 'Hermione Granger', email: emailTeste, senha: 'senha1234'
  });
  assert.equal(cadastro.status, 201);
  assert.equal(cadastro.body.usuario.email, emailTeste);
  assert.equal('senha' in cadastro.body.usuario, false);
  assert.equal('senhaHash' in cadastro.body.usuario, false);

  const duplicado = await request(app).post('/auth/register').send({
    nome: 'Hermione', email: emailTeste, senha: 'senha1234'
  });
  assert.equal(duplicado.status, 409);
});

test('login válido e inválido', async () => {
  const errado = await request(app).post('/auth/login').send({
    email: emailTeste, senha: 'senha-incorreta'
  });
  assert.equal(errado.status, 401);

  const login = await request(app).post('/auth/login').send({
    email: emailTeste, senha: 'senha1234'
  });
  assert.equal(login.status, 200);
  assert.ok(login.body.token);
  token = login.body.token;
});

test('CRUD completo protegido por JWT e retornos 404', async () => {
  const semToken = await request(app).post('/personagens').send({
    nome: 'Luna Lovegood', casa: 'Corvinal', especie: 'Humano', ocupacao: 'Bruxa'
  });
  assert.equal(semToken.status, 401);

  const corpo = {
    nome: 'Luna Lovegood', casa: 'Corvinal', especie: 'Humano', ocupacao: 'Bruxa'
  };
  const criado = await request(app).post('/personagens').set('Authorization', `Bearer ${token}`).send(corpo);
  assert.equal(criado.status, 201);
  personagemId = criado.body.id;

  const lista = await request(app).get('/personagens');
  assert.equal(lista.status, 200);
  assert.ok(lista.body.some(personagem => personagem.id === personagemId));

  const detalhe = await request(app).get(`/personagens/${personagemId}`);
  assert.equal(detalhe.status, 200);
  assert.equal(detalhe.body.nome, corpo.nome);

  const atualizado = await request(app).put(`/personagens/${personagemId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ ...corpo, ocupacao: 'Pesquisadora' });
  assert.equal(atualizado.status, 200);
  assert.equal(atualizado.body.ocupacao, 'Pesquisadora');

  const inexistente = await request(app).get('/personagens/999999');
  assert.equal(inexistente.status, 404);
  const alterarInexistente = await request(app).put('/personagens/999999')
    .set('Authorization', `Bearer ${token}`).send(corpo);
  assert.equal(alterarInexistente.status, 404);
  const excluirInexistente = await request(app).delete('/personagens/999999')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(excluirInexistente.status, 404);

  const excluido = await request(app).delete(`/personagens/${personagemId}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(excluido.status, 200);
  assert.equal((await request(app).get(`/personagens/${personagemId}`)).status, 404);
});

test('JWT expirado ou inválido retorna 401', async () => {
  const invalido = await request(app).post('/personagens')
    .set('Authorization', 'Bearer token-invalido').send({});
  assert.equal(invalido.status, 401);
});
