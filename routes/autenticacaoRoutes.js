const express = require('express');
const router = express.Router();
const autenticacaoController = require('../controllers/autenticacaoController');
const perfilLimiter = require('./rateLimiter');

// Rota para cadastro de usuário
// Chama a função cadastrarUsuario do controlador
router.post('/cadastro-usuario', autenticacaoController.cadastrarUsuario);

// Rota para login de usuário
router.post('/login-usuario', autenticacaoController.loginUsuario);

// Rota para pegar perfil do usuário
// "perfilLimiter" é uma sugestão do verificador automatico de codigo e segurança do github...
// ... ele basicamente vai impedir que um mesmo IP possa fazer requisições de mais (ataque DDOS)
// O que importa mesmo aqui é o "verificarToken": o nome é auto-explicativo
router.get('/get-usuario-perfil', 
    autenticacaoController.verificarTokenMiddleware, 
    perfilLimiter, 
    autenticacaoController.getPerfilUsuario
);

module.exports = router;