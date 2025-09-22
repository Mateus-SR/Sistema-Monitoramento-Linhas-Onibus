// Use "type: commonjs" in package.json to use CommonJS modules (comentario do exemplo do Vercel)
const express = require('express'); // Para facilitar o uso geral do node.js
const axios = require('axios'); // Para facilicar o uso de fetchs (chamar os dados da api)
const app = express();

const tolkien = process.env.tolkien;
const apiURL = 'https://api.olhovivo.sptrans.com.br/v2.1'

async function tokenPOST() {
    try {
      console.log('Enviando POST');
      // ATENÇÃO: Substitua pela URL de autenticação da sua API
      const response = await axios.post(`${apiURL}/Login/Autenticar?token=${tolkien}`);
  
      // A resposta da SPTrans em caso de sucesso é o booleano 'true' e um cookie.
      // O status da resposta será 200.
      if (response.data === true) {
        console.log(`Sucesso na autenticação! Status: ${response.status}`);
        // Esse ainda é um caso apenas de teste, e não estamos guardando nenhuma informação importante para rodar as proximas consultas na api
        return { success: true, status: response.status, data: response.data };
      } else {
        // Se a resposta não for 'true', algo deu errado mesmo com status 200.
        throw new Error('Autenticação falhou, resposta inesperada.');
      }
  
    } catch (error) {
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


// Definições das rotas (o que fazer quando chamarmos tal coisa)
app.get('/', (req, res) => {
  res.json({ message: 'Alo olá! Servidor rodando.' });
});

app.get('/testar-auth', async (req, res) => {
    console.log('Rota de teste /testar-auth foi chamada!');
    const resultado = await tokenPOST(); // Executa a função de verificação (ali de cima)
    // Envia o resultado da autenticação de volta para o navegador
    res.json(resultado);
  });
 
// Linha que faz o Vercel cuidar de executar tudo
module.exports = app;