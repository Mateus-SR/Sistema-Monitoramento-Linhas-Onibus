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
      const response = await axios.post(apiURL, {
        tolkien
      });
  
      accessToken = response.data.token; 
      console.log('Sucesso!');

    } catch (error) {
      console.error('Erro! ', error.message);
    }
  }


// Definições das rotas (o que fazer quando chamarmos tal coisa)
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express on Vercel!' });
});
 
// Linha que faz o Vercel cuidar de executar tudo
module.exports = app;