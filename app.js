// Use "type: commonjs" in package.json to use CommonJS modules (comentario do exemplo do Vercel)
const express = require('express'); // Para facilitar o uso geral do node.js
const cors = require('cors');
const path = require('path'); // Importante para caminhos de arquivo

// Inicializa o App
const app = express();

// Configurações Globais
app.use(cors());
app.use(express.json());

// Servindo arquivos estáticos (CSS, JS, Imagens)
// Mantemos a pasta public para assets gerais
app.use(express.static(path.join(__dirname, 'public')));

// Se você mover os HTMLs para public/views, precisamos dizer ao servidor
// para enviar esses arquivos quando o usuário acessar as rotas raiz.

// Rota Raiz (Home)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});

// Rota Login
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
});

// Rota Cadastro
app.get('/cadastro.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'cadastro.html'));
});

// Rota Exibição
app.get('/exibicao.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'exibicao.html'));
});

// Rota Configuração
app.get('/configuracao.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'configuracao.html'));
});

// Rota Favoritos
app.get('/favoritos.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'favoritos.html'));
});

// Rota Sobre
app.get('/sobre.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'sobre.html'));
});


const autenticacaoRoutes = require('./routes/autenticacaoRoutes');
const exibicaoRoutes = require('./routes/exibicaoRoutes');
const spTransRoutes = require('./routes/spTransRoutes');

// Usando Rotas da API
app.use('/', autenticacaoRoutes);
app.use('/', exibicaoRoutes);
app.use('/', spTransRoutes);

app.get('/api-status', (req, res) => {
  res.json({ message: 'Servidor rodando em homenagem aos saudosos:\nErick Neo\nGuilherme Calixto\nLuciano Batista' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}!`);
      console.log(`Acesse: http://localhost:${PORT}`);
  });
}

// Exporta o app
module.exports = app;