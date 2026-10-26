const express = require('express');
const { registrar, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registrar);
router.post('/login', login);

// Compatibilidade com os caminhos antigos, agora persistidos no banco.
router.post('/usuarios', registrar);

module.exports = router;
