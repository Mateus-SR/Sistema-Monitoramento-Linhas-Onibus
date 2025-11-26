const axios = require('axios');

// Token Padrão do Sistema (Environment Variable)
const DEFAULT_TOKEN = process.env.tolkien;
const apiURL = 'https://api.olhovivo.sptrans.com.br/v2.1';
const paradaPrevisao = '/Previsao/Parada?codigoParada=';

// Cache simples APENAS para o token padrão do sistema
// (Tokens de usuários não serão cacheados aqui para garantir segurança e não misturar sessões)
let defaultSessionCookie = null;

/**
 * Autentica na API e retorna o Cookie de Sessão.
 * Se tokenUsuario for null, usa o DEFAULT_TOKEN e tenta usar cache.
 */
async function autenticar(tokenUsuario = null) {
    try {
        const usarTokenPadrao = !tokenUsuario;
        const tokenFinal = tokenUsuario || DEFAULT_TOKEN;

        // Se for para usar o padrão e já temos cookie salvo, retorna ele (Cache)
        if (usarTokenPadrao && defaultSessionCookie) {
            return defaultSessionCookie;
        }

        console.log(`Autenticando com token: ${usarTokenPadrao ? 'PADRÃO DO SISTEMA' : 'PERSONALIZADO DO USUÁRIO'}...`);
        
        const response = await axios.post(`${apiURL}/Login/Autenticar?token=${tokenFinal}`);

        if (response.data === true) {
            const cookie = response.headers['set-cookie'];
            
            // Se for o token padrão, salvamos no cache global
            if (usarTokenPadrao) {
                defaultSessionCookie = cookie;
                console.log('(Cookie padrão atualizado e cacheado)');
            }

            return cookie;
        } else {
            throw new Error('Autenticação falhou (API retornou false). Verifique se o Token é válido.');
        }

    } catch (error) {
        // Se der erro no padrão, limpa o cache
        if (!tokenUsuario) defaultSessionCookie = null;

        console.error(`Erro na autenticação!`);
        if (error.response) {
            // Erro 401 ou outro da API
            throw error; // Joga o erro pro Controller tratar
        } else {
            throw new Error(error.message);
        }
    }
}

// Mantemos essa função auxiliar para validação (agora adaptada para uso interno)
async function tokenPOST(tokenUsuario = null) {
    try {
        const cookie = await autenticar(tokenUsuario);
        return { success: true, cookie: cookie };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Função auxiliar para converter hora
function converteHoraMinuto(horaMinuto) {
    if (typeof horaMinuto !== 'string' || !horaMinuto.includes(':')) {
        return 0; 
    }
    const hmSeparado = horaMinuto.split(':');
    let hora = parseInt(hmSeparado[0]) * 60;
    let minuto = parseInt(hmSeparado[1]);
    return hora + minuto;
}

// Processamento dos dados (Igual ao original)
function processarResultadoParada(dadosParada){
  return {
    horaRequest: dadosParada.hr,
    ponto: dadosParada.p.cp,
    linhas: dadosParada.p.l.map(linhaIndividual => {
      let proximoOnibus = null;
      if (linhaIndividual.vs && linhaIndividual.vs.length > 0) {
        let checkPrevisao = linhaIndividual.vs[0].t;
        checkPrevisao = converteHoraMinuto(checkPrevisao);
        let horaRequest = dadosParada.hr; 
        horaRequest = converteHoraMinuto(horaRequest);
        const resultadoCheck = checkPrevisao - horaRequest;

        if (resultadoCheck >= 0 && resultadoCheck <= 60) { // Aumentei margem de segurança
          proximoOnibus = {
            proximoOnibusCodigo: linhaIndividual.vs[0].p,
            proximoOnibusPrevisao: linhaIndividual.vs[0].t,
            latitude: linhaIndividual.vs[0].py,
            longitude: linhaIndividual.vs[0].px
          }
        }
      }
      return {
        codigoLetreiro: linhaIndividual.c,
        sentidoLinha: linhaIndividual.sl === 1 ? linhaIndividual.lt0 : linhaIndividual.lt1,
        quantidadeOnibus: linhaIndividual.qv,
        proximoOnibus: proximoOnibus
      };
    })
  };
}

// --- FUNÇÃO RADAR (Agora aceita tokenUsuario) ---
async function getRadarParada(listaCodigos, tokenUsuario = null) {
    
    // 1. Pega o cookie correto (do usuário ou padrão)
    let cookieSessao = await autenticar(tokenUsuario);

    // 2. Faz as requisições usando esse cookie
    const arrayPesquisas = listaCodigos.map(codigoParada => {
        return axios.get(`${apiURL}${paradaPrevisao}${codigoParada}`, { 
            headers: {'Cookie': cookieSessao}
        });
    });

    try {
        const respostas = await Promise.all(arrayPesquisas);
        
        const resumosProcessados = respostas.map(resposta => {
            const dadosParada = resposta.data;
            return processarResultadoParada(dadosParada);
        });

        return resumosProcessados;

    } catch (error) {
        // Se der erro de autenticação (401) no meio do processo
        if (error.response && error.response.status === 401) {
            // Se for o token padrão, limpa o cache pra forçar renovação na proxima
            if (!tokenUsuario) defaultSessionCookie = null;
            throw new Error('Houve uma falha na comunicação, e a API não nos autenticou.');
        }
        throw error;
    }
}

// --- FUNÇÃO PING (Agora aceita tokenUsuario) ---
async function pingPonto(codigo, tokenUsuario = null) {
    
    // 1. Pega o cookie correto
    let cookieSessao = await autenticar(tokenUsuario);

    const respostaPing = await axios.get(`${apiURL}${paradaPrevisao}${codigo}`, { 
        headers: {'Cookie': cookieSessao}
    });

    const pingDados = respostaPing.data;

    if (respostaPing.status === 200 && (pingDados === null || pingDados.p === null)) {
        throw new Error('Ponto de ônibus inválido ou não encontrado.');
    }

    return { message: 'Ponto de ônibus válido!' };
}

module.exports = {
    tokenPOST,
    getRadarParada,
    pingPonto
};