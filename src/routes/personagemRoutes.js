const express = require('express');
const autenticarToken = require('../middlewares/authMiddleware');
const personagemController = require('../controllers/personagemController');

const router = express.Router();

router.get('/', personagemController.listar);
router.get('/:id', personagemController.buscarPorId);
router.post('/', autenticarToken, personagemController.criar);
router.put('/:id', autenticarToken, personagemController.atualizar);
router.delete('/:id', autenticarToken, personagemController.excluir);

module.exports = router;
