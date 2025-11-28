const express = require('express');
const router = express.Router();
const exibicaoController = require('../controllers/exibicaoController');
const autenticacaoController = require('../controllers/autenticacaoController'); // Para o middleware de token
const perfilLimiter = require('./rateLimiter'); // Para limitar requisições

// Rota para criar uma nova exibição (Requer login e tem rate limit)
router.post('/cria-exibicao', 
    autenticacaoController.verificarTokenMiddleware, 
    perfilLimiter, 
    exibicaoController.criarExibicao
);

// Rota PÚBLICA para buscar uma exibição pelo código
router.get('/exibicao/:codigo_exib', exibicaoController.getExibicao);

// Rota para buscar todas as exibições do usuário (Requer login)
router.get('/get-usuario-exibicoes', 
    autenticacaoController.verificarTokenMiddleware, 
    exibicaoController.getExibicoesUsuario
);

router.post('/favoritar', 
    autenticacaoController.verificarTokenMiddleware, 
    exibicaoController.favoritar
);

router.post('/desfavoritar', 
    autenticacaoController.verificarTokenMiddleware, 
    exibicaoController.desfavoritar
);

router.get('/verificar-favorito', 
    autenticacaoController.verificarTokenMiddleware, 
    exibicaoController.verificarFavorito
);

router.get('/meus-favoritos', 
    autenticacaoController.verificarTokenMiddleware, 
    exibicaoController.listarFavoritos
);

router.put('/editar-exibicao', 
    autenticacaoController.verificarTokenMiddleware, 
    exibicaoController.editarExibicao
);

module.exports = router;