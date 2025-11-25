const express = require('express');
const router = express.Router();
const spTransController = require('../controllers/spTransController');

// Rota para testar autenticação manualmente
router.get('/testar-auth', spTransController.testarAuth);

// Rota para verificar se um ponto existe (usado na criação de exibição)
router.get('/ping-ponto', spTransController.pingPonto);

// Rota principal do radar (pega previsões dos ônibus)
router.get('/parada-radar', spTransController.paradaRadar);

module.exports = router;