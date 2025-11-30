import { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim } from './loadingAnim.js';
import defaultEnv from './_defaultEnv.js';

const vercel = defaultEnv.API_URL;

document.addEventListener('DOMContentLoaded', () => {
    
    // Configura o botão voltar para manter o código na URL
    const btnVoltar = document.getElementById('btnVoltar');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => {
            // Volta para a página anterior (exibicao.html?codigo=...)
            window.history.back(); 
        });
    }

    iniciaSistemaMapa();
});

async function iniciaSistemaMapa() {
    iniciaAnim();

    try {
        // 1. PEGA O CÓDIGO DA URL
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const codigoExibicao = urlParams.get('codigo');

        if (!codigoExibicao) {
            throw new Error("Código da exibição não encontrado na URL.");
        }

        // 2. Busca os códigos das paradas
        const exibicao = await getCodigos(codigoExibicao);
        if (!exibicao || !exibicao.paradas || exibicao.paradas.length === 0) {
            throw new Error("Exibição sem paradas configuradas.");
        }

        const codigosParada = exibicao.paradas.map(p => p.codigo_parada).join(',');

        // 3. Inicia o radar (Loop)
        await radarMapa(codigosParada);
        setInterval(() => radarMapa(codigosParada), 5000);

    } catch (error) {
        erroAnim();
        setTexto("Erro ao carregar mapa");
        setSubTexto(error.message);
    }
}

// Função auxiliar para buscar a exibição
async function getCodigos(codigoExibicao) {
    const resposta = await fetch(`${vercel}/exibicao/${codigoExibicao}`);
    if (!resposta.ok) throw new Error("Erro ao buscar dados da exibição.");
    return await resposta.json();
}

// Função principal do Radar (Versão Exclusiva para o Mapa)
async function radarMapa(codigosParada) {
    try {
        const resposta = await fetch(`${vercel}/parada-radar?codigos=${codigosParada}`, {
            method: 'GET', 
            headers: { 'Content-Type': 'application/json' },
        });

        if (!resposta.ok) throw new Error("Erro na comunicação com a API.");

        const dados = await resposta.json();
        
        // --- NOVO: Centralizar no primeiro ponto encontrado ---
        if (dados.length > 0 && dados[0].ponto) {
            const p = dados[0].ponto;
            // Verifica se a função existe no escopo global (definida em mapa.js)
            if (window.definirPontoFixo) {
                // Passa latitude (py), longitude (px) e nome
                window.definirPontoFixo(p.latitude, p.longitude, p.nome);
            }
        }
        // -----------------------------------------------------

        // Prepara a lista limpa para o mapa.js
        const listaParaMapa = [];

        dados.forEach(resumoParada => {
            resumoParada.linhas.forEach(linha => {
                if (linha.proximoOnibus) {
                    const bus = linha.proximoOnibus;
                    // Tenta pegar coordenadas (py/px ou latitude/longitude)
                    const lat = bus.py || bus.latitude;
                    const lng = bus.px || bus.longitude;

                    if (lat && lng) {
                        listaParaMapa.push({
                            prefixo: bus.proximoOnibusCodigo,
                            latitude: lat,
                            longitude: lng,
                            linha: linha.codigoLetreiro // Para mostrar no popup
                        });
                    }
                }
            });
        });

        // CHAMA O SEU ARQUIVO mapa.js EXISTENTE
        if (window.atualizarMapa) {
            window.atualizarMapa(listaParaMapa);
        }

        fechaAnim(); // Fecha o loading na primeira execução

    } catch (error) {
        console.error("Erro no radar do mapa:", error);
    }
}