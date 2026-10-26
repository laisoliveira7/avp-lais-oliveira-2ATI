const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const autenticarToken = require('../middlewares/authMiddleware');

// `uploads` existe no repositório original como arquivo vazio; use uma pasta
// separada para preservar esse item e manter o caminho público /uploads.
const uploadDir = path.resolve(__dirname, '../../uploads-files');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, arquivo, callback) => {
      const extensao = path.extname(arquivo.originalname).toLowerCase();
      callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, arquivo, callback) => {
    const extensoesPermitidas = ['.jpg', '.jpeg', '.png'];
    const extensao = path.extname(arquivo.originalname).toLowerCase();
    if (!extensoesPermitidas.includes(extensao)) {
      return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'imagem'));
    }
    return callback(null, true);
  }
});

const router = express.Router();
router.post('/', autenticarToken, upload.single('imagem'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ mensagem: 'Envie um arquivo no campo imagem.' });
  }
  return res.json({
    mensagem: 'Imagem enviada com sucesso.',
    arquivo: req.file.filename,
    caminho: `/uploads/${req.file.filename}`
  });
});

module.exports = { router, uploadDir };
