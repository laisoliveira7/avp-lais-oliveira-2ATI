require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

if (!process.env.JWT_SECRET) {
  throw new Error('Defina JWT_SECRET no arquivo .env antes de iniciar a API.');
}

const app = require('./app');
const sequelize = require('./config/database');
const { Personagem } = require('./models');

const porta = Number(process.env.PORT) || 3000;

async function iniciarServidor() {
  await sequelize.authenticate();
  await sequelize.sync();

  // Preserva o personagem que já era apresentado como exemplo no projeto.
  if (await Personagem.count() === 0) {
    await Personagem.create({
      nome: 'Harry Potter',
      casa: 'Grifinória',
      especie: 'Humano',
      ocupacao: 'Auror'
    });
  }

  app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
  });
}

iniciarServidor().catch(error => {
  console.error('Não foi possível iniciar a API. Verifique o banco e as variáveis de ambiente.', error.message);
  process.exitCode = 1;
});
