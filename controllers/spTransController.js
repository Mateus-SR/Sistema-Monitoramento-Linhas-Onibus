const spTransService = require('../services/spTransService');
const { createClient } = require('@supabase/supabase-js');
const { prisma } = require('../models/prisma');
const jwt = require('jsonwebtoken');

// --- CONFIGURAÇÃO SUPABASE (Backend) ---
// Idealmente, coloque isso em variáveis de ambiente (.env)
const supabaseUrl = process.env.supabaseUrl;
const supabaseKey = process.env.supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- FUNÇÃO AUXILIAR: Extrai o token do usuário ---
async function getUserSpTransToken(req) {
    try {
        // Pega o token que veio no Header (Enviado pelo Front-end)
        const authHeader = req.headers['x-access-token'] || req.headers['authorization'];
        
        if (!authHeader) return null; // Usuário deslogado

        const token = authHeader.replace('Bearer ', '');
        
        // Pergunta pro Supabase quem é o dono desse token
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) return null;

        // Retorna o token personalizado (se existir) ou null
        return user.user_metadata?.sptrans_token || null;

    } catch (e) {
        console.error("Erro ao validar usuário Supabase:", e.message);
        return null;
    }
}

// Controlador para a rota /testar-auth
async function testarAuth(req, res) {
    console.log('Rota de teste /testar-auth foi chamada!');
    // Teste simples, usa sempre o padrão
    const resultado = await spTransService.tokenPOST(null); 
    res.json(resultado);
}

// Controlador para a rota /ping-ponto
async function pingPonto(req, res) {
  console.log('Verificando ponto...');
  try{
    const codigo = req.query.codigo;

    // 1. Tenta pegar o token do usuário
    const userToken = await getUserSpTransToken(req);
    if (userToken) console.log("Usando Token Personalizado do Usuário!");

    if (!codigo) {
      return res.status(400).json({
        error: 'Erro ao verificar código. (400, Bad Request)'
      });
    }
    
    // 2. Passa o token (ou null) para o Serviço
    const resultado = await spTransService.pingPonto(codigo, userToken);
    
    res.status(200).json(resultado);

  } catch (error) {
    // ... (Lógica de erro mantida igual, só omiti para economizar espaço) ...
    if (error.response && error.response.status === 401) {
        console.log('[401] Token inválido.')
        return res.status(401).json({ error: 'Token da API expirado ou inválido.' });
    } else if (error.message === 'Ponto de ônibus inválido ou não encontrado.') {
        return res.status(404).json({ error: error.message });
    } else {
        console.error('Erro pingPonto:', error.message);
        return res.status(500).json({ error: 'Falha interna.' });
    }
  }
}

// Controlador para a rota /parada-radar
async function paradaRadar(req, res) {
  // console.log('Iniciando radar...'); // Comentei pra não poluir o log
  try{
    const codigos = req.query.codigos;
    const codigoExibicao = req.query.codigoExibicao;

    let userToken = null;

    // Se temos o código da exibição, buscamos o dono dela no banco
    if (codigoExibicao) {
        const exibicao = await prisma.exibicao.findUnique({
            where: { codigo_exib: codigoExibicao },
            include: { usuario: true } // Inclui dados do dono, pois vamos usar o token da api dele aqui
        });

        // 
        if (exibicao && exibicao.usuario && exibicao.usuario.token_usu) {
            userToken = exibicao.usuario.token_usu;
            console.log(`Usando token do proprietário da exibição (${exibicao.usuario.nome_usu})`);
        }
    }

    if (!codigos) {
      return res.status(400).json({ error: 'Erro ao buscar exibição.' });
    }

    const listaCodigos = codigos.split(',');
    
    // 2. Passa o token (ou null) para o Serviço
    const resumosProcessados = await spTransService.getRadarParada(listaCodigos, userToken);

    res.json(resumosProcessados);

  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('[401] Erro de autenticação SPTrans.')
    } else {
      console.error('Erro radar:', error.message);
    }
    res.status(500).json({error: 'Houve uma falha na comunicação com a API da SPTrans.'})
  }
}

// Rota para validar um token recebido no corpo da requisição (antes de salvar)
async function validarTokenManual(req, res) {
    const { API_TOKEN } = req.body;
    if (!API_TOKEN) return res.status(400).json({ error: 'Token não fornecido.' });

    try {
        const resultado = await spTransService.tokenPOST(API_TOKEN);
        if (resultado.success) {
            res.json({ valid: true, message: 'Token válido!' });
        } else {
            res.status(401).json({ valid: false, error: 'Token inválido ou expirado.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao validar token.' });
    }
}

// Controlador para a rota /registrar-status
async function registrarStatus(req, res) {
  const { nome_onibus, status, diferenca_minutos, id_onibus } = req.body;

  // Lógica para tentar identificar o usuário (se houver token), mas sem bloquear se não houver
  let id_usu = null;
  const authHeader = req.headers['x-access-token'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
        // Tenta decodificar quem é o usuário
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        id_usu = payload.id_usu;
    } catch (e) {
        // Se o token for inválido, apenas ignoramos e segue como anônimo (id_usu = null)
        console.log("Token inválido ou expirado no registro de status, registrando como anônimo.");
    }
  }

  try {
    const atrasado = status === 'Atrasado' ? 1 : 0;
    const adiantado = status === 'Adiantado' ? 1 : 0;

    await prisma.relatorio.create({
      data: {
        nomeonibus_rel: nome_onibus,
        atrasado_rel: atrasado,
        adiantado_rel: adiantado,
        mediaespera_rel: diferenca_minutos.toString(),
        usu_id: id_usu, 
        id_onibus: id_onibus
      }
    });

    res.status(200).json({ message: "Status registrado com sucesso" });

  } catch (error) {
    console.error("Erro ao registrar status:", error);
    res.status(500).json({ error: "Erro interno" });
  }
}

module.exports = {
  testarAuth,
  pingPonto,
  paradaRadar,
  validarTokenManual,
  registrarStatus
};