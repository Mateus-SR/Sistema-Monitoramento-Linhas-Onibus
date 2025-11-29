// middlewares/verificarLimite.js
const { prisma } = require('../models/prisma'); // Certifique-se que o caminho para o prisma está correto

const verificarLimiteExibicoes = async (req, res, next) => {
    const id_usu = req.id_usuario_logado; // Esse ID vem do middleware de autenticação anterior

    try {
        // Conta quantas exibições esse usuário já tem
        const contagem = await prisma.exibicao.count({
            where: {
                id_usu: id_usu
            }
        });

        // Se tiver 5 ou mais, bloqueia
        if (contagem >= 5) {
            return res.status(403).json({
                error: "Limite de 5 exibições foi excedido."
            });
        }

        // Se tiver menos de 5, deixa passar para o controller
        next();

    } catch (error) {
        console.error("Erro ao verificar limite:", error);
        return res.status(500).json({ error: "Erro interno ao verificar limites." });
    }
};

module.exports = verificarLimiteExibicoes;