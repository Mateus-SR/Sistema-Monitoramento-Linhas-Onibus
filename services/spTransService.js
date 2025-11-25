const axios = require('axios'); // Para facilicar o uso de fetchs (chamar os dados da api)

// Variáveis de ambiente e constantes da SPTrans
const tolkien = process.env.tolkien;
const apiURL = 'https://api.olhovivo.sptrans.com.br/v2.1'
const paradaPrevisao = '/Previsao/Parada?codigoParada=';
let apiSessionCookie = null;

// Função para autenticar na API da SPTrans
async function tokenPOST() {
    try {
      console.log('Enviando POST');
      const response = await axios.post(`${apiURL}/Login/Autenticar?token=${tolkien}`);
  
      // A resposta da SPTrans em caso de sucesso é o booleano 'true' e um cookie.
      // O status da resposta será 200.
      if (response.data === true) {
        const cookie = response.headers['set-cookie'];
        apiSessionCookie = cookie;

        console.log(`(Cookie armazenado em apiSessionCookie)`);
        console.log(`Sucesso na autenticação! Status: ${response.status}`);

        return { success: true, status: response.status, data: response.data };
      } else {
        // Se a resposta não for 'true', algo deu errado mesmo com status 200.
        throw new Error('Autenticação falhou, resposta inesperada.');
      }
  
    } catch (error) {
      // Em caso de erro, é melhor limpar os cookies de autenticação, para evitar qualquer problema
      apiSessionCookie = null;
        console.log(`Erro na autenticação!`);
        if (error.response) {
          // Se o erro veio da API (ex: token inválido)
          console.error(`Status: ${error.response.status}`);
          console.error(`Data: ${error.response.data}`);
          return { success: false, status: error.response.status, data: error.response.data };
        } else {
          // Erro de rede ou outro problema
          console.error(`Mensagem: ${error.message}`);
          return { success: false, message: error.message };
        }
    }
}

// Função auxiliar para converter hora string em minutos
function converteHoraMinuto(horaMinuto) {
    if (typeof horaMinuto !== 'string' || !horaMinuto.includes(':')) {
        console.warn(`Tentativa de converter hora inválida: ${horaMinuto}`);
        return 0; 
    }

    const hmSeparado = horaMinuto.split(':');
    
    let hora = parseInt(hmSeparado[0]);
    hora = hora * 60;
  
    let minuto = parseInt(hmSeparado[1]);
  
    let resultado = hora + minuto;
    return resultado;
}

// Função auxiliar para processar os dados brutos da SPTrans
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

        // futuramente mudar esse 20 pra uma variavel da tabela configuração
        if (resultadoCheck >= 0 && resultadoCheck <= 20) {
          proximoOnibus = {
            proximoOnibusCodigo: linhaIndividual.vs[0].p,
            proximoOnibusPrevisao: linhaIndividual.vs[0].t,
            proximoOnibusPosicaoX: linhaIndividual.vs[0].px,
            proximoOnibusPosicaoY: linhaIndividual.vs[0].py
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

// Função principal: Busca previsões (Radar)
async function getRadarParada(listaCodigos) {
    // Verificando se estamos autenticados. Caso não, então vamos nos autenticar.
    if (!apiSessionCookie) {
      console.log('Não estamos autenticados! Mas vamos tentar estar em breve...');
      await tokenPOST();
    }

    // E então verificamos de novo, mas só dessa vez, pra não entrar em um loop infinito de verificações
    if (!apiSessionCookie) {
      throw new Error('Houve uma falha na comunicação, e a API não nos autenticou.');
    }

    const arrayPesquisas = listaCodigos.map(codigoParada => {
      return axios.get(`${apiURL}${paradaPrevisao}${codigoParada}`, { 
        headers: {'Cookie': apiSessionCookie}
      });
    });;

    const respostas = await Promise.all(arrayPesquisas);

    const resumosProcessados = respostas.map(resposta => {
      const dadosParada = resposta.data;
      return processarResultadoParada(dadosParada);
    });

    return resumosProcessados;
}

// Função principal: Verifica se um ponto existe (Ping)
async function pingPonto(codigo) {
    // Verificando se estamos autenticados. Caso não, então vamos nos autenticar.
    if (!apiSessionCookie) {
      console.log('Não estamos autenticados! Mas vamos tentar estar em breve...');
      await tokenPOST();
    }

    // E então verificamos de novo, mas só dessa vez, pra não entrar em um loop infinito de verificações
    if (!apiSessionCookie) {
       throw new Error('Houve uma falha na comunicação, e a API não nos autenticou.');
    }

    const respostaPing = await axios.get(`${apiURL}${paradaPrevisao}${codigo}`, { 
        headers: {'Cookie': apiSessionCookie}
    });

    const pingDados = respostaPing.data;

    if (respostaPing.status === 200 && (pingDados === null || pingDados.p === null)) {
      throw new Error('Ponto de ônibus inválido ou não encontrado.');
    }

    return { message: 'Ponto de ônibus válido!' };
}

// Exporta as funções que o Controller vai precisar usar
module.exports = {
    tokenPOST,
    getRadarParada,
    pingPonto
};