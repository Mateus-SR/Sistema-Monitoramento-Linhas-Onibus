import { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim, setSimNao } from './loadingAnim.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAÇÕES INICIAIS ---
    const vercel = 'https://sistema-monitoramento-linhas-onibus.vercel.app';
    const htmlElement = document.documentElement;
    const registroOnibus = new Map();

    // --- ELEMENTOS DO DOM ---
    const HideBtn = document.getElementById("hideBtn1");
    const HideElement = document.getElementById("hideElement1");
    const Clock = document.getElementById("horas");
    const minus = document.getElementById('minus');
    const plus = document.getElementById('plus');
    const HideBtnText = document.getElementById('HideBtnText');
    const textoTitulo = document.getElementById('textoTitulo');
    const textoCodigo = document.getElementById('textoCodigo');
    const input = document.getElementById('barraPesquisa');
    const tabelaBody = document.getElementById('tabelaBody');
    const filtroSelect = document.getElementById('filtroOrdenacao'); // Seleciona o filtro
    
    let isHidden = false;

    // --- INICIALIZAÇÃO DO SISTEMA ---
    iniciaSistema();

    async function iniciaSistema() {
        iniciaAnim();

        try {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const codigoExibicao = urlParams.get('codigo');

            if (!codigoExibicao) {
                throw new Error("Não foi possível encontrar a exibição.");
            }

            carregarBackupLocal(codigoExibicao); 

            const exibicao = await getCodigos(codigoExibicao);

            if (!exibicao || !exibicao.paradas || exibicao.paradas.length === 0) {
                throw new Error("Exibição encontrada, mas não contém pontos de parada.");
            }

            const codigosParada = exibicao.paradas.map(p => p.codigo_parada).join(',');

            await radarOnibus(codigosParada);
            setInterval(() => radarOnibus(codigosParada), 5000);
            setTituloCodigo(exibicao);

        } catch (error) {
            erroAnim();
            setTexto("Oops! Erro!!");
            setSubTexto(error.message);
        }
    };

    // --- EVENT LISTENERS (Botões e Filtros) ---

    // 1. Botão de Esconder Menu
    HideBtn.addEventListener('click', () => {
        HideElement.classList.toggle('-translate-y-full');
        isHidden = HideElement.classList.contains('-translate-y-full');

        if (isHidden) {
            HideBtnText.classList.remove('fa-chevron-up');
            HideBtnText.classList.add('fa-chevron-down');
        } else {
            HideBtnText.classList.remove('fa-chevron-down');
            HideBtnText.classList.add('fa-chevron-up');
        }
    });

    // 2. Filtro de Pesquisa (Texto)
    input.addEventListener('input', () => {
        const filtro = input.value.toLowerCase();
        const linhas = tabelaBody.getElementsByTagName('tr');
    
        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i];
            const texto = linha.textContent.toLowerCase();
            linha.style.display = texto.includes(filtro) ? '' : 'none';
        }
    });

    // 3. Filtro de Ordenação (Nome/Horário)
    if (filtroSelect) {
        filtroSelect.addEventListener('change', ordenarTabela);
    }

    // 4. Zoom (Botões + e -)
    plus.addEventListener('click', () => {
        if (zoomAtual < zoomNivel.length - 1) {
            zoomAtual++;
            mudarZoom("plus");
        };
    });

    minus.addEventListener('click', () => {
        if (zoomAtual > 0) {
            zoomAtual--;
            mudarZoom("minus");
        };
    });

    // --- RELÓGIO ---
    setInterval(() => {
        const hoje = new Date();
        let hora = verificaNumero(hoje.getHours());
        let minuto = verificaNumero(hoje.getMinutes());
        let segundo = verificaNumero(hoje.getSeconds());
        Clock.innerHTML = hora + ":" + minuto + ":" + segundo;
    }, 1000);

    function verificaNumero(variavel) {
        if (variavel < 10) variavel = "0" + variavel;
        return variavel;
    }

    // --- FUNÇÕES DE ZOOM ---
    const zoomNivel = [50, 67, 75, 90, 100, 110, 125, 133, 150];
    let zoomAtual = 4;
    const zoomPopUpID = 'zoomPopUpContainer';

    function mudarZoom(tipo) {
        const zoomValor = zoomNivel[zoomAtual];
        htmlElement.style.fontSize = `${zoomValor}%`;

        if (zoomAtual === 0) minus.classList.remove('hover:text-sptrans');
        else if (zoomAtual === zoomNivel.length - 1) plus.classList.remove('hover:text-sptrans');
        else {
            minus.classList.add('hover:text-sptrans');
            plus.classList.add('hover:text-sptrans');
        }
        mostraZoom(zoomValor, tipo);
    };

    function mostraZoom(zoomValor, tipo) {
        let oldPopUp = document.getElementById(zoomPopUpID);
        if (oldPopUp) oldPopUp.remove();
    
        const zoomPopUp = document.createElement('div');;
        zoomPopUp.id = zoomPopUpID;
        zoomPopUp.className = "text-3xl fixed top-4 left-1/2 -translate-x-1/2 z-[1000] mt-[32px] py-[10px] px-[14px] text-center font-roboto-mono animate-fadeOutHold bg-white text-sptrans font-bold shadow-xl rounded-2xl border-2 border-gray-400";
        
        const iHTML = `<i class="fas fa-search-${tipo}" style="vertical-align: middle;"></i>`;
        const pHTML = `<span class="ml-2" style="vertical-align: middle;">${zoomValor}%</span>`;
        zoomPopUp.innerHTML = iHTML + pHTML;

        document.body.appendChild(zoomPopUp);
        zoomPopUp.addEventListener('animationend', () => zoomPopUp.remove(), { once: true });
    };

    // --- FUNÇÕES DA API E TABELA ---

    async function setTituloCodigo(exibicao) {
        if (!exibicao.nome_exibicao) textoTitulo.innerText = "Exibição";
        else textoTitulo.innerText = exibicao.nome_exibicao;
        textoCodigo.innerText += ' ' + exibicao.codigo_exib;
    }

    async function getCodigos(codigoExibicao) {
        try {
            const codigosUrl = `${vercel}/exibicao/${codigoExibicao}`
            const resposta = await fetch(codigosUrl);

            if (!resposta.ok) {
                if (resposta.status === 404) throw new Error("Essa exibição não existe. O código está certo?");
                throw new Error("Não foi possível encontrar a exibição.");
            }
            return await resposta.json();
        } catch (error) {
            erroAnim();
            setTexto("Oops! Erro!!");
            setSubTexto(error.message);
        }
    };

    // Substitua a função inteira 'radarOnibus' por esta versão atualizada:

async function radarOnibus(codigosParada) { 
    const timestamp = Date.now();
    const onibusAtivos = new Set();
    
    // --- NOVO: Array para guardar dados que vão para o mapa ---
    const listaParaMapa = []; 

    try {
        console.log(`${timestamp}: rodando bloco try.`);
        const resposta = await fetch(`${vercel}/parada-radar?codigos=${codigosParada}`, {
            method: 'GET', 
            headers: { 'Content-Type': 'application/json' },
        });

        if (!resposta.ok) {
            let errorMsg = `Erro ${resposta.status} do servidor.`;
            try {
                const errorData = await resposta.json();
                errorMsg = errorData.error || errorMsg; 
            } catch (e) {}
            throw new Error(errorMsg); 
        }

        const dados = await resposta.json();
        // console.log('Dados recebidos do backend:', dados); // Opcional: descomente para debug
        
        dados.forEach(resumoParada => {
            const horaRequest = resumoParada.horaRequest;
            resumoParada.linhas.forEach(linha => {
                if (linha.proximoOnibus) {
                    const codigoLetreiro = linha.codigoLetreiro;
                    const sentidoLinha = linha.sentidoLinha;
                    const quantidadeOnibus = linha.quantidadeOnibus;
                    
                    // Dados do Veículo
                    const proximoOnibusObj = linha.proximoOnibus;
                    const proximoOnibusCodigo = proximoOnibusObj.proximoOnibusCodigo;
                    const proximoOnibusPrevisao = proximoOnibusObj.proximoOnibusPrevisao;

                    // --- NOVO: Captura as coordenadas para o mapa ---
                    // Tenta pegar py/px (padrão SPTrans) ou latitude/longitude
                    const lat = proximoOnibusObj.py || proximoOnibusObj.latitude;
                    const lng = proximoOnibusObj.px || proximoOnibusObj.longitude;

                    // Só adiciona na lista do mapa se tiver coordenada válida
                    if (lat && lng) {
                        listaParaMapa.push({
                            prefixo: proximoOnibusCodigo,
                            latitude: lat,
                            longitude: lng,
                            linha: codigoLetreiro
                        });
                    }
                    // ------------------------------------------------

                    escreveOnibus(proximoOnibusCodigo, codigoLetreiro, sentidoLinha, quantidadeOnibus, proximoOnibusPrevisao, horaRequest);
                    onibusAtivos.add(proximoOnibusCodigo);
                }
            });
        });

        // Limpa ônibus antigos da memória local
        registroOnibus.forEach(function(value, key){
            if (!onibusAtivos.has(key)) registroOnibus.delete(key);
        })

        preparaTabela(onibusAtivos);

        // --- NOVO: Envia a lista processada para o mapa.js ---
        if (window.atualizarMapa) {
            window.atualizarMapa(listaParaMapa);
        }
        // -----------------------------------------------------

        // Lógica de Backup (mantive igual ao seu original)
        const urlParams = new URLSearchParams(window.location.search);
        const codigoAtual = urlParams.get('codigo');
        if (codigoAtual) {
            salvarBackupLocal(codigoAtual);
        }

        fechaAnim();

    } catch (error) {
        erroAnim();
        setTexto("Oops! Erro!!");
        setSubTexto(`Um erro (${error}) ocorreu.`)
        console.error(`${timestamp}: erro (${error}) ao rodar bloco try.`);
    }
 }

    function escreveOnibus(proximoOnibusCodigo, codigoLetreiro, sentidoLinha, quantidadeOnibus, proximoOnibusPrevisao, horaRequest) {
        const onibusExistente = registroOnibus.has(proximoOnibusCodigo)
        const onibusRegistroInfo = { 
            Letreiro: codigoLetreiro,
            NomeSentido: sentidoLinha,
            QntdOnibus: quantidadeOnibus,
            Promessa: proximoOnibusPrevisao,
            Previsao: proximoOnibusPrevisao,
            DataPedido: horaRequest
        };

        if (!onibusExistente) {
            registroOnibus.set(proximoOnibusCodigo, onibusRegistroInfo)
        } else {
            const fichaAntiga = registroOnibus.get(proximoOnibusCodigo);
            fichaAntiga.Previsao = proximoOnibusPrevisao;
            registroOnibus.set(proximoOnibusCodigo, fichaAntiga);
        };
    }

    function preparaTabela(onibusAtivos) {
        // Atualiza ou cria linhas
        registroOnibus.forEach((value, proximoOnibusCodigo) => {
            let linhaExistente = document.getElementById(`onibus-${proximoOnibusCodigo}`);

            if (!linhaExistente) {
                constroiTabela(value, proximoOnibusCodigo)
            } else {
                const celulaPrevisao = linhaExistente.querySelector('.previsao');
                celulaPrevisao.textContent = value.Previsao;
                const celulaStatus = linhaExistente.querySelector('.status');
                const novoStatus = constroiStatus(value, proximoOnibusCodigo);
                celulaStatus.outerHTML = novoStatus;
            }
        })

        // Remove linhas que sumiram da API
        for (const onibus of tabelaBody.children) {
            const codigo = onibus.id.split('-')[1];
            if (!onibusAtivos.has(codigo)) {
                if (!onibus.classList.contains('animate-fadeOut')) {
                    onibus.classList.add('animate-fadeOut');
                    onibus.addEventListener('animationend', () =>{
                        onibus.remove();
                        onibus?.classList.remove('animate-fadeOut');
                    }, {once: true});
                }
            } else {
                onibus.classList.remove('animate-fadeOut');
            }
        }

        // === AQUI ESTÁ A ORDENAÇÃO AUTOMÁTICA ===
        ordenarTabela(); 
    }

    function constroiTabela(value, proximoOnibusCodigo) {
        const codigoLetreiro = value.Letreiro;
        const sentidoLinha = value.NomeSentido;
        const proximoOnibusPrevisao = value.Previsao;

        const novaLinha = document.createElement('tr'); 
        novaLinha.className = "border-b hover:bg-gray-50";
        novaLinha.id = `onibus-${proximoOnibusCodigo}`

        const celulaLinhas = `
            <td class="text-center py-3 px-6 font-extrabold">${codigoLetreiro}</td>
            <td class="text-center py-3 px-6 ">${sentidoLinha}</td>
            <td class="text-center py-3 px-6 previsao">${proximoOnibusPrevisao}</td>`

        const celulaStatus = constroiStatus(value, proximoOnibusCodigo);
        novaLinha.innerHTML = celulaLinhas + celulaStatus;
        novaLinha.classList.add('animate-fadeIn');

        // Filtro de pesquisa
        const filtroAtual = input.value.toLowerCase();
        if (filtroAtual) {
            const textoDaLinha = novaLinha.textContent.toLowerCase();
            if (!textoDaLinha.includes(filtroAtual)) novaLinha.style.display = 'none';
        }

        tabelaBody.appendChild(novaLinha);
    };

    function constroiStatus(value, proximoOnibusCodigo) {
        let horarioPrevistoPromessa = converteHoraMinuto(value.Promessa);
        let horarioPrevistoAtual = converteHoraMinuto(value.Previsao);
        let diferencaPrevisoes = horarioPrevistoAtual - horarioPrevistoPromessa;

        var statusCor = "green"; 
        var statusTexto = "Normal"; 

        if (diferencaPrevisoes >= 2) {
            statusCor = "yellow";
            statusTexto = "Atrasado"; 
            registrarIncidente(value.Letreiro, proximoOnibusCodigo, "Atrasado", diferencaPrevisoes);
        } else if (diferencaPrevisoes <= -2) {
            statusCor = "blue";
            statusTexto = "Adiantado"; 
            registrarIncidente(value.Letreiro, proximoOnibusCodigo, "Adiantado", diferencaPrevisoes);
        }
        
        return `
        <td class="text-center py-3 px-6 status">
            <span class="inline-flex items-center px-3 py-1 rounded-full bg-${statusCor}-100 text-${statusCor}-700 font-semibold text-sm lg:text-2xl">
                <span class="relative flex w-2 h-2 mr-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-${statusCor}-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-${statusCor}-600"></span>
                </span>
            ${statusTexto}
            </span>
        </td>`
    }

    function converteHoraMinuto(horaMinuto) {
        const hmSeparado = horaMinuto.split(':');
        let hora = parseInt(hmSeparado[0]) * 60;
        let minuto = parseInt(hmSeparado[1]);
        return hora + minuto;
    }

    async function registrarIncidente(nome, proximoOnibusCodigo, status, diferenca) {
        const token = localStorage.getItem('tokenLogin');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['X-Access-Token'] = `Bearer ${token}`;
    
        try {
            await fetch('https://sistema-monitoramento-linhas-onibus.vercel.app/registrar-status', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    nome_onibus: nome,
                    status: status,
                    diferenca_minutos: diferenca,
                    id_onibus: proximoOnibusCodigo
                })
            });
        } catch (e) {
            console.error("Falha ao registrar incidente", e);
        }
    }

    // === FUNÇÃO DE ORDENAÇÃO (Agora só existe uma vez aqui) ===
    function ordenarTabela() {
        const criterio = filtroSelect.value;
        // Pega as linhas atuais da tabela
        const linhas = Array.from(tabelaBody.getElementsByTagName('tr'));

        if (criterio === 'padrao') return;

        linhas.sort((a, b) => {
            // Célula 1 = Nome, Célula 2 = Previsão
            if (criterio === 'nome') {
                const nomeA = a.cells[1].innerText.trim();
                const nomeB = b.cells[1].innerText.trim();
                return nomeA.localeCompare(nomeB);
            } 
            else if (criterio === 'tempo') {
                const tempoA = a.cells[2].innerText.trim();
                const tempoB = b.cells[2].innerText.trim();
                return tempoA.localeCompare(tempoB);
            }
            return 0;
        });

        linhas.forEach(linha => tabelaBody.appendChild(linha));
    }

   // === NOVAS FUNÇÕES DE BACKUP (LOCALSTORAGE) ===

    // Salva o estado atual dos ônibus no navegador
    function salvarBackupLocal(codigoExibicao) {
        // O localStorage não aceita "Map", então convertemos para um Array de Arrays
        const dadosArray = Array.from(registroOnibus.entries());
        
        const backup = {
            codigoExibicao: codigoExibicao, // Salva qual é a tela atual (pra não carregar dados da linha errada)
            timestamp: Date.now(), // Salva a hora que guardou
            dados: dadosArray
        };

        localStorage.setItem('backupOnibus', JSON.stringify(backup));
    }

    // Tenta recuperar os dados assim que a página abre
    function carregarBackupLocal(codigoExibicaoAtual) {
        const backupString = localStorage.getItem('backupOnibus');
        
        if (backupString) {
            const backup = JSON.parse(backupString);

            // Só carregamos se o backup for DA MESMA EXIBIÇÃO que estamos agora
            // (Para evitar mostrar ônibus de Itaquera na tela de Pinheiros)
            if (backup.codigoExibicao === codigoExibicaoAtual) {
                
                // Reconstrói o Map a partir do Array salvo
                backup.dados.forEach(([key, value]) => {
                    registroOnibus.set(key, value);
                });

                console.log("Backup recuperado do LocalStorage!", registroOnibus);

                // Força a tabela a ser desenhada com esses dados antigos enquanto a API nova não chega
                // Criamos um Set com todas as chaves para simular o "onibusAtivos"
                const chavesRecuperadas = new Set(registroOnibus.keys());
                preparaTabela(chavesRecuperadas);
            }
        }
    }

});