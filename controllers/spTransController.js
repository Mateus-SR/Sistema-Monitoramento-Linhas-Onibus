const spTransService = require('../services/spTransService');

// Controlador para a rota /testar-auth
async function testarAuth(req, res) {
    console.log('Rota de teste /testar-auth foi chamada!');
    const resultado = await spTransService.tokenPOST(); // Executa a função de verificação
    // Envia o resultado da autenticação de volta para o navegador
    res.json(resultado);
}

// Controlador para a rota /ping-ponto
async function pingPonto(req, res) {
  console.log('Verificando ponto...');
  try{
    const codigo = req.query.codigo;

    if (!codigo) {
      return res.status(400).json({
        error: 'Erro ao verificar código. (400, Bad Request)'
      });
    }
    
    const resultado = await spTransService.pingPonto(codigo);
    res.status(200).json(resultado);

    // Caso dê erro, e ele seja 401 (Forbidden), quer dizer que a pesquisa é invalida, ou o token é.
  } catch (error) {
    if (error.response) {
      // O erro veio da API da SPTrans (axios)
      const status = error.response.status;

      if (status === 401) {
        console.log('[401] Pesquisa inválida ou sessão expirada.')
        // Força renovação de token na próxima (lógica simplificada, idealmente o service lidaria com retry)
        return res.status(401).json({ error: 'Token da API expirado ou inválido.' });
      
      } else {
        // Outro erro da API (400, 404, 500, 503...)
        console.error(`Erro da API SPTrans: ${status}`, error.message);
        return res.status(status).json({ error: `Erro da API SPTrans: ${status}` });
      }

    } else if (error.message === 'Ponto de ônibus inválido ou não encontrado.') {
      // Captura o erro que lançamos no service
      console.log('Validação falhou:', error.message);
      return res.status(404).json({ error: error.message });
    
    } else if (error.message === 'Houve uma falha na comunicação, e a API não nos autenticou.') {
        return res.status(500).json({error: error.message});
    } else {
      // Erro inesperado
      console.error('Erro ao processar verificação:', error.message);
      return res.status(500).json({ error: 'Houve uma falha interna na comunicação.' });
    }
  }
}

// Controlador para a rota /parada-radar
async function paradaRadar(req, res) {
  console.log('Iniciando radar nas paradas...');
  try{
    const codigos = req.query.codigos;

    if (!codigos) {
      return res.status(400).json({
        error: 'Erro ao buscar exibição.'
      });
    }

    const listaCodigos = codigos.split(',');
    
    const resumosProcessados = await spTransService.getRadarParada(listaCodigos);

    res.json(resumosProcessados);

    // Caso dê erro, e ele seja 401 (Forbidden), quer dizer que a pesquisa é invalida, ou o token é.
} catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('[401] Pesquisa inválida ou sessão expirada.')
      // apiSessionCookie = null; // Isso seria ideal no service
    } else {
      // Adicionado para logar outros erros
      console.error('Erro ao processar radar:', error.message);
    }
    
    // Se o erro tiver uma mensagem específica que lançamos, usamos ela
    if (error.message === 'Houve uma falha na comunicação, e a API não nos autenticou.') {
        return res.status(500).json({error: error.message});
    }

    res.status(500).json({error: 'Houve uma falha na comunicação com a API da SPTrans.'})
  }
}

module.exports = {
    testarAuth,
    pingPonto,
    paradaRadar
};