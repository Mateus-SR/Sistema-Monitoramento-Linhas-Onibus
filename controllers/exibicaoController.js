const { prisma } = require('../models/prisma'); // Importa a instância do Prisma
const { nanoid } = require('nanoid');

// Cria uma nova exibição
async function criarExibicao(req, res) {
  const usuarioLogado = req.id_usuario_logado;
  const { nome_exibicao, codigos_parada } = req.body;
  
  if (!codigos_parada || !Array.isArray(codigos_parada) || codigos_parada.length === 0 || codigos_parada.length > 5) {
    return res.status(400).json({ 
      error: 'Há um problema com codigos_parada. (Não é nulo? É um array? Igual a 0? Maior que 5?).' 
    });
  }

  try {
    let codigo_exib;
    let existe = true;

    // Gera um código único de 6 caracteres
    while (existe) {
      codigo_exib = nanoid(6);
      const exibicaoExistente = await prisma.exibicao.findUnique({
        where: { codigo_exib: codigo_exib }
      });
      existe = !!exibicaoExistente;
    }
  
    // Salva no banco de dados
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
}

// Favoritar uma exibição
async function favoritar(req, res) {
  const id_usuario = req.id_usuario_logado; // Vem do Middleware de autenticação
  const { codigo_exib } = req.body; // O frontend deve enviar { "codigo_exib": "XXXXXX" }

  try {
    // 1. Precisamos achar o ID interno (UUID) da exibição baseada no código público
    const exibicao = await prisma.exibicao.findUnique({
        where: { codigo_exib: codigo_exib }
    });

    if (!exibicao) {
        return res.status(404).json({ error: 'Exibição não encontrada para favoritar.' });
    }

    // 2. Verifica se já está favoritado para não duplicar
    const jaFavorito = await prisma.favoritos.findFirst({
        where: {
            usu_id: id_usuario,
            exib_id: exibicao.id_exib // Usa o UUID interno
        }
    });

    if (jaFavorito) {
        return res.status(200).json({ message: "Esta exibição já está nos seus favoritos." });
    }
  
    // 3. Salva no banco de dados
    const novoFavorito = await prisma.favoritos.create({
      data: {
        usu_id: id_usuario,
        exib_id: exibicao.id_exib
      }
    });

    res.status(201).json({
      message: "Sucesso ao favoritar!",
      dados: novoFavorito
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro ao favoritar.'
    });
  }
}

// Remover dos favoritos
async function desfavoritar(req, res) {
    const id_usuario = req.id_usuario_logado;
    const { codigo_exib } = req.body;
  
    try {
      // 1. Busca a exibição pelo código para pegar o ID interno
      const exibicao = await prisma.exibicao.findUnique({
          where: { codigo_exib: codigo_exib }
      });
  
      if (!exibicao) {
          return res.status(404).json({ error: 'Exibição não encontrada.' });
      }
  
      // 2. Remove o registro da tabela de favoritos
      // Usamos deleteMany para garantir que removemos apenas o vínculo deste usuário com esta exibição
      await prisma.favoritos.deleteMany({
        where: {
          usu_id: id_usuario,
          exib_id: exibicao.id_exib
        }
      });
  
      res.status(200).json({
        message: "Removido dos favoritos com sucesso!"
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'Erro ao desfavoritar.'
      });
    }
}

// Busca uma exibição pelo código público (6 dígitos)
async function getExibicao(req, res) {
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
}

// Busca todas as exibições de um usuário logado
async function getExibicoesUsuario(req, res) {
  try {
    // Pegamos o id do usuario que queremos achar...
    const id_usu = req.id_usuario_logado;

    const exibicoes = await prisma.exibicao.findMany({
      where: {
        id_usu: id_usu
      },
      include: {
        paradas: {
          select: { codigo_parada: true }
        }
      }
    });

    res.status(200).json(exibicoes);


  } catch(error) {
    console.error("Erro ao buscar exibições: ", error);
    res.status(500).json({
      error: 'Erro interno do servidor.'
    });
  }
}

module.exports = {
    criarExibicao,
    getExibicao,
    getExibicoesUsuario,
    favoritar
};