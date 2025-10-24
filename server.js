// Use "type: commonjs" in package.json to use CommonJS modules (comentario do exemplo do Vercel)
const express = require('express'); // Para facilitar o uso geral do node.js
const axios = require('axios'); // Para facilicar o uso de fetchs (chamar os dados da api)
const cors = require('cors');


const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const tolkien = process.env.tolkien;
const apiURL = 'https://api.olhovivo.sptrans.com.br/v2.1'
const paradaPrevisao = '/Previsao/Parada?codigoParada=';
let apiSessionCookie = null;


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

function converteHoraMinuto(horaMinuto) {
  const hmSeparado = horaMinuto.split(':');
  hora = parseInt(hmSeparado[0]);
  hora = hora * 60;

  minuto = parseInt(hmSeparado[1]);

  resultado = hora + minuto;
  return resultado;
}

// Definições das rotas (o que fazer quando chamarmos tal coisa)
app.get('/', (req, res) => {
  res.json({ message: 'Servidor rodando em homenagem aos saudosos:\nErick Neo\nGuilherme Calixto\nLuciano Batista' });
});

app.get('/testar-auth', async (req, res) => {
    console.log('Rota de teste /testar-auth foi chamada!');
    const resultado = await tokenPOST(); // Executa a função de verificação (ali de cima)
    // Envia o resultado da autenticação de volta para o navegador
    res.json(resultado);
  });
 
app.get('/parada-radar', async (req, res) => {
  console.log('Iniciando radar nas paradas...');
  try{
    // Verificando se estamos autenticados. Caso não, então vamos nos autenticar.
    if (!apiSessionCookie) {
      console.log('Não estamos autenticados! Mas vamos tentar estar em breve...');
      await tokenPOST();
    }

    // E então verificamos de novo, mas só dessa vez, pra não entrar em um loop infinito de verificações
    if (!apiSessionCookie) {
      return res.status(500).json({error: 'Houve uma falha na comunicação, e a API não nos autenticou.'});
    }

    // Como no momento precisamos apenas pesquisar por esses dois pontos de onibus, essa solução de procurar só por eles é suficiente
    const codigoParada1 = "650004840"; // É o ponto em frente ao campinho
    const codigoParada2 = "360004841"; // É o ponto do outro lado da rua

    // Aqui, estamos criando duas pesquisas, mas apenas criando elas e anexando nossa chave (token), porque...
    const pesquisa1 = axios.get(`${apiURL}${paradaPrevisao}${codigoParada1}`, { headers: {'Cookie': apiSessionCookie}
    });
    const pesquisa2 = axios.get(`${apiURL}${paradaPrevisao}${codigoParada2}`, { headers: {'Cookie': apiSessionCookie}
    });

    //... como vamos fazer duas pesquisas, é mais sábio fazer elas ao mesmo tempo.
    // Pra isso, nós usamos esse "Promise.all", com as pesquisas que criamos ali em cima...
    const resultado = await Promise.all([pesquisa1, pesquisa2]);
    //... e os resultados vem em uma array, que guardamos seu conteudo separamente.
    const resultadoPesquisa1 = resultado[0].data;
    const resultadoPesquisa2 = resultado[1].data;

    // E por fim, exibimos os resultados em formato json
/*     res.json({
      pesquisa1: {codigoParada: codigoParada1, resultados: resultadoPesquisa1},
      pesquisa2: {codigoParada: codigoParada2, resultados: resultadoPesquisa2}
    }) */

    const resumoPesquisa1 = {
      horaRequest: resultadoPesquisa1.hr,
      ponto: resultadoPesquisa1.p.cp,

      linhas: resultadoPesquisa1.p.l.map(linhaIndividual => {
        let proximoOnibus = null;
        if (linhaIndividual.vs && linhaIndividual.vs.length > 0) {

          let checkPrevisao = linhaIndividual.vs[0].t;
          checkPrevisao = converteHoraMinuto(checkPrevisao);

          let horaRequest = resultadoPesquisa2.hr;
          horaRequest = converteHoraMinuto(horaRequest);

          const resultadoCheck = checkPrevisao - horaRequest;

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

    const resumoPesquisa2 = {
      horaRequest: resultadoPesquisa2.hr,
      ponto: resultadoPesquisa2.p.cp,

      linhas: resultadoPesquisa2.p.l.map(linhaIndividual => {
        let proximoOnibus = null;
        if (linhaIndividual.vs && linhaIndividual.vs.length > 0) {

          let checkPrevisao = linhaIndividual.vs[0].t;
          checkPrevisao = converteHoraMinuto(checkPrevisao);

          let horaRequest = resultadoPesquisa2.hr;
          horaRequest = converteHoraMinuto(horaRequest);

          const resultadoCheck = checkPrevisao - horaRequest;

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

    res.json({resumoPesquisa1: resumoPesquisa1,
      resumoPesquisa2: resumoPesquisa2
    });

    // Caso dê erro, e ele seja 401 (Forbidden), quer dizer que a pesquisa é invalida, ou o token é.
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('[401] Pesquisa inválida ou sessão expirada.')
      apiSessionCookie = null;
    }
    res.status(500).json({error: 'Houve uma falha na comunicação, e a API não nos autenticou.'})
  }
})

/*#######################################################################################################
Seção da API, node, vercel, e afins
#######################################################################################################*/

app.post('/cadastro-usuario', async (req, res) => {

  const dados ={nome, email, senha, instituicao, semInstituicao} = req.body;

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    await prisma.usuario.create({
      data: {
        nome_usu: nome,
        email_usu: email,
        senha_usu: senhaHash,
        fac_id: 1
      }
    });
    res.status(201).json({
      message: "Sucesso ao criar usuário!"
    });
  } catch (error) {

    console.error(error);
    res.status(500).json({
      error: 'Erro ao criar usuario.'
    });
  }
});

app.post('/login-usuario', async (req, res) => {
  const {email, senha} = req.body;

  try {
    const usuarioEncontrado = await prisma.usuario.findUnique({
      where: {
        email_usu: email
      },
    });

    if (!usuarioEncontrado) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    const senhaHashDB = usuarioEncontrado.senha_usu;
    const senhaCorreta = await bcrypt.compare(senha, senhaHashDB);

    if (senhaCorreta) {
      const payload = {
        id_usu: usuarioEncontrado.id_usu,
        email_usu: usuarioEncontrado.email_usu
      };

      const segredo = process.env.JWT_SECRET;
      const tokenLogin = jwt.sign(
        payload,
        segredo/*,
        { expiresIn: '18h'}*/
      );

      res.status(200).json({
        message: 'Sucesso ao logar!',
        tokenLogin: tokenLogin
       });

    } else {
      return res.status(401).json({
        error: 'E-mail ou senha inválidos.'
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro de servidor' });
  }
});

app.get('/get-usuario-perfil', verificarToken, async (req, res) => {
  try {
    const id_usu = req.id_usuario_logado;

    const usuarioEncontrado = await prisma.usuario.findUnique({
      where: {
        id_usu: id_usu
      },/*
      select: {
        nome_usu: true
      }*/
    });

      if (usuarioEncontrado) {
        res.status(200).json(usuarioEncontrado);
      } else {
        res.status(404).json({
          error: 'Usuario não encontrado.'
        })
      };
  } catch(error) {
    console.error("Erro ao buscar usuário: ", error);
    res.status(500).json({
      error: 'Erro interno do servidor.'
    });
  }
});

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const tokenAuth = authHeader && authHeader.split(' ')[1];

  if (tokenAuth == null) {
    return res.status(401).json({
      error: 'Erro ao carregar tokenAuth. Você está mesmo autenticado?'
    });
  }

  try {
    const payload = jwt.verify(tokenAuth, segredo);
    req.id_usuario_logado = payload.id_usu;

    next();

  } catch (error) {
    return res.status(403).json({
      error: 'Token é inválido ou expirou...'
    })
  }
}
// Linha que faz o Vercel cuidar de executar tudo
module.exports = app;