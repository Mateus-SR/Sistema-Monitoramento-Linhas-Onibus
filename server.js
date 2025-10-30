// Use "type: commonjs" in package.json to use CommonJS modules (comentario do exemplo do Vercel)
const express = require('express'); // Para facilitar o uso geral do node.js
const axios = require('axios'); // Para facilicar o uso de fetchs (chamar os dados da api)
const cors = require('cors');

const rateLimit = require('express-rate-limit');

const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

const app = express();
app.use(cors());
app.use(express.json());

// Set up rate limiter: 100 requests per 15 minutes per IP
const perfilLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: {
    error: 'Muitas requisições feitas deste IP. Por favor, tente novamente mais tarde.'
  }
});

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
    const codigos = req.query.codigos;

    if (!codigos) {
      res.status(404).json({
        error: 'Erro ao buscar exibição.'
      });

      const listaCodigos = req.query.codigos.split(',');
    
    // Verificando se estamos autenticados. Caso não, então vamos nos autenticar.
    if (!apiSessionCookie) {
      console.log('Não estamos autenticados! Mas vamos tentar estar em breve...');
      await tokenPOST();
    }

    // E então verificamos de novo, mas só dessa vez, pra não entrar em um loop infinito de verificações
    if (!apiSessionCookie) {
      return res.status(500).json({error: 'Houve uma falha na comunicação, e a API não nos autenticou.'});
    }

    const arrayPesquisas = listaCodigos.map(codigoParada => {
      return axios.get(`${apiURL}${paradaPrevisao}${codigoDaParada}`, { 
        headers: {'Cookie': apiSessionCookie}
      });
    });

    const respostas = await Promise.all(arrayPesquisas);

    const resumosProcessados = respostas.map(resposta => {
      const dadosParada = resposta.data;

      return processarResultadoParada(dadosParada);
    });

    res.json(resumosProcessados);

    // Caso dê erro, e ele seja 401 (Forbidden), quer dizer que a pesquisa é invalida, ou o token é.
} catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('[401] Pesquisa inválida ou sessão expirada.')
      apiSessionCookie = null;
    } else {
      // Adicionado para logar outros erros
      console.error('Erro ao processar radar:', error.message);
    }
    res.status(500).json({error: 'Houve uma falha na comunicação com a API da SPTrans.'})
  }
});

function processarResultadoParada(dadosParada){
  return {
    horaRequest: dadosParada.hr,
    ponto: dadosParada.p.cp,
    linhas: dadosParada.p.l.map(linhaIndividual => {
      let proximoOnibus = null;
      if (linhaIndividual.vs && linhaIndividual.vs.length > 0) {

        let checkPrevisao = linhaIndividual.vs[0].t;
        checkPrevisao = converteHoraMinuto(checkPrevisao);

        // <-- MUDANÇA/CORREÇÃO DE BUG:
        // O código original usava 'resultadoPesquisa2.hr' aqui dentro.
        // O correto é usar a hora da *própria* parada ('dadosParada.hr').
        let horaRequest = dadosParada.hr; 
        horaRequest = converteHoraMinuto(horaRequest);

        const resultadoCheck = checkPrevisao - horaRequest;

        // (Sua lógica de 20 minutos está perfeita)
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



app.post('/cria-exibicao', verificarToken, perfilLimiter, async (req, res) => {
  const usuarioLogado = req.id_usuario_logado;
  const {codigos_parada, nome_exibicao } = req.body;
  
  if (!codigos_parada || !Array.isArray(codigos_parada) || codigos_parada.length === 0 || codigos_parada.length > 5) {
    return res.status(400).json({ 
      error: 'Há um problema com codigos_parada. (Não é nulo? É um array? Igual que 0? Maior que 5?).' 
    });
  }

  try {
    let codigo_exib;
    let existe = true;

    while (existe) {
      codigo_exib = nanoid(6);
      const exibicaoExistente = await prisma.exibicao.findUnique({
        where: { codigo_exib: codigo_exib }
      });
      existe = !!exibicaoExistente;
    }
  
    const novaExibicao = await prisma.exibicao.create({
      data: {
        id_usu: usuarioLogado,
        codigo_exib: codigo_exib,
        nome_exibicao: nome_exibicao,
        
        paradas: {
          create: codigos_parada.map( cadaCodigo => ({
            codigo_parada: cadaCodigo
          }))
        }
      }
    });

    res.status(201).json({
      message: "Sucesso ao criar exibição!",
      codigo_exib: codigo_exib,
      dados: novaExibicao // Envia o objeto completo recém-criado
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro ao criar exibição.'
    });
  }
});

app.get('/exibicao/:codigo_exib', async (req, res) => {
  const codigo_exib = req.params.codigo_exib;

  try {
    const exibicao = await prisma.exibicao.findUnique({
      where: { codigo_exib: codigo_exib
      },
      include: {
        paradas: {
          select: { 
            codigo_parada: true } 
        }
      }
    });

    if (exibicao) {
      res.status(200).json(exibicao);
    } else {
      console.error(error);
      res.status(404).json({
        error: 'Erro ao buscar exibição.'
      });
    }
    

  } catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'Ocorreu um erro interno do servidor.'
     });
  }
});
/*#######################################################################################################
Seção da banco de dados, prisma, supabase, e afins
#######################################################################################################*/

app.post('/cadastro-usuario', async (req, res) => {
  // Esses dados vieram lá do front-end, e vieram dentro desse req
  const {nome, email, senha, instituicao, semInstituicao} = req.body;

  try {
    // Pedimos pra criar uma senha criptografada, e guardamos apenas ela (nada de guardar a senha original! Nunca!)
    const senhaHash = await bcrypt.hash(senha, 10);
    // Mandamos o prisma criar (inserir) na tabela usuario as informações que entregamos no formulario
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
    // Procuramos no banco de dados por um email que coincida com aquele que colocamos no formulario
    const usuarioEncontrado = await prisma.usuario.findUnique({
      where: {
        email_usu: email
      },
    });

    // Se não encontramos, então houve algum problema no processo
    if (!usuarioEncontrado) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    // Trazemos de volta a senha criptografada...
    const senhaHashDB = usuarioEncontrado.senha_usu;
    // ... e comparamos se ela é a mesma senha que colocamos agora
    const senhaCorreta = await bcrypt.compare(senha, senhaHashDB);

    // Se for, criamos uma especie de "crachá de identificação"
    if (senhaCorreta) {
      const payload = {
        id_usu: usuarioEncontrado.id_usu,
        email_usu: usuarioEncontrado.email_usu
      };

      const tokenLogin = jwt.sign(
        payload,
        process.env.JWT_SECRET/*,
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

// "perfilLimiter" é uma sugestão do verificador automatico de codigo e segurança do github...
// ... ele basicamente vai impedir que um mesmo IP possa fazer requisições de mais (ataque DDOS)
// O que importa mesmo aqui é o "verificarToken": o nome é auto-explicativo
app.get('/get-usuario-perfil', verificarToken, perfilLimiter, async (req, res) => {
  try {
    // Pegamos o id do usuario que queremos achar...
    const id_usu = req.id_usuario_logado;

    // ... e procuramos pra ver se ele existe mesmo
    // Existindo, então mandamos pro front-end (veja ali que essa é uma rota GET)
    const usuarioEncontrado = await prisma.usuario.findUnique({
      where: {
        id_usu: id_usu
      },/*
      select: {
        nome_usu: true
      }*/
    });

      if (usuarioEncontrado) {
        // (mandando o perfil do usuario como json, para o front-end ler)
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
  // Pegamos o crachá que foi criado
  const authHeader = req.headers['x-access-token'];

  // e vemos se ele começa com o padrão que o Jsonwebtoken cria
  if (!authHeader ||!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token de autenticação ausente ou não começa com "Bearer".'
    });
  }

  // Pegando a string a partir do 7º caractere (pra pular o "Bearer ", coisa padrão do token do Jsonwebtoken)
  // E só depois de sabermos que é um token valido e existente
  const tokenAuth = authHeader.substring(7);

  if (tokenAuth == null) {
    return res.status(401).json({
      error: 'tokenAuth não pode ser encontrado'
    });
  }

  try {
    const payload = jwt.verify(tokenAuth, process.env.JWT_SECRET);
    req.id_usuario_logado = payload.id_usu;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        error: 'Token expirado.'
      });
    } else {
      return res.status(403).json({
        error: 'Token inválido.'
    });
  }
}
}
// Linha que faz o Vercel cuidar de executar tudo
module.exports = app;