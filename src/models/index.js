const Personagem = require('./Personagem');
const Usuario = require('./Usuario');

Usuario.hasMany(Personagem, {
  as: 'personagensCriados',
  foreignKey: { name: 'usuarioId', allowNull: true }
});
Personagem.belongsTo(Usuario, {
  as: 'criador',
  foreignKey: { name: 'usuarioId', allowNull: true }
});

module.exports = { Personagem, Usuario };
