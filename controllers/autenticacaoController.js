// Importa as dependências necessárias (que antes estavam no server.js)
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- Funções de Lógica de Negócio (O antigo "Bloco B") ---

// 1. Cadastro de Usuário
const cadastrarUsuario = async (req, res) => {
  const { nome, email, senha, instituicao, semInstituicao } = req.body;

  try {
    // Criptografa a senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Salva no banco usando o Prisma
    // (Nota: fac_id: 1 está hardcoded como no original, podemos melhorar isso depois)
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
};

// 2. Login de Usuário
const loginUsuario = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuarioEncontrado = await prisma.usuario.findUnique({
      where: { email_usu: email },
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

      // Cria o token JWT
      const tokenLogin = jwt.sign(
        payload,
        process.env.JWT_SECRET
      );

      res.status(200).json({
        message: 'Sucesso ao logar!',
        tokenLogin: tokenLogin
       });

    } else {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro de servidor' });
  }
};

// 3. Middleware para Verificar Token (Função auxiliar)
// Esta função intercepta a requisição para garantir que o usuário está logado
const verificarTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers['x-access-token'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token de autenticação ausente ou não começa com "Bearer".'
    });
  }

  const tokenAuth = authHeader.substring(7);

  if (!tokenAuth) {
    return res.status(401).json({ error: 'Token não encontrado' });
  }

  try {
    const payload = jwt.verify(tokenAuth, process.env.JWT_SECRET);
    req.id_usuario_logado = payload.id_usu; // Salva o ID para a próxima função usar
    next(); // Passa para a próxima função (getPerfilUsuario)

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expirado.' });
    } else {
      return res.status(403).json({ error: 'Token inválido.' });
    }
  }
};

// 4. Obter Perfil do Usuário
const getPerfilUsuario = async (req, res) => {
  try {
    // O id_usuario_logado foi colocado aqui pelo middleware acima
    const id_usu = req.id_usuario_logado;

    const usuarioEncontrado = await prisma.usuario.findUnique({
      where: { id_usu: id_usu },
    });

    if (usuarioEncontrado) {
      res.status(200).json(usuarioEncontrado);
    } else {
      res.status(404).json({ error: 'Usuario não encontrado.' });
    }
  } catch(error) {
    console.error("Erro ao buscar usuário: ", error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const atualizarTokenSpTrans = async (req, res) => {
  const id_usu = req.id_usuario_logado;
  const { API_TOKEN } = req.body;

  try {
    await prisma.usuario.update({
      where: { id_usu: id_usu },
      data: { token_usu: API_TOKEN } // Salva na coluna token_usu lá do banco de dados
    });

    res.status(200).json({ message: "Token atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar token:", error);
    res.status(500).json({ error: "Erro ao salvar token no banco de dados." });
  }
};


// Exporta todas as funções para serem usadas na rota
module.exports = {
  cadastrarUsuario,
  loginUsuario,
  verificarTokenMiddleware,
  getPerfilUsuario,
  atualizarTokenSpTrans
};