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
    
    // --- DOIS CONTAINERS AGORA (MOBILE E DESKTOP) ---
    const listaMobile = document.getElementById('view-mobile'); 
    const tabelaDesktop = document.getElementById('tabelaDesktop'); 
    
    const filtroSelect = document.getElementById('filtroOrdenacao');
    
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

    // --- EVENT LISTENERS ---

    HideBtn?.addEventListener('click', () => {
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

    // Filtro de Pesquisa (Filtra nos DOIS lugares)
    input?.addEventListener('input', () => {
        const filtro = input.value.toLowerCase();
        
        // Filtra Mobile
        if(listaMobile) {
            Array.from(listaMobile.children).forEach(el => {
                const texto = el.innerText.toLowerCase();
                el.style.display = texto.includes(filtro) ? 'flex' : 'none';
            });
        }

        // Filtra Desktop
        if(tabelaDesktop) {
            Array.from(tabelaDesktop.children).forEach(el => {
                const texto = el.innerText.toLowerCase();
                el.style.display = texto.includes(filtro) ? 'table-row' : 'none';
            });
        }
    });

    // Ordenação
    if (filtroSelect) {
        filtroSelect.addEventListener('change', ordenarTudo);
    }

    // Zoom
    plus?.addEventListener('click', () => {
        if (zoomAtual < zoomNivel.length - 1) {
            zoomAtual++;
            mudarZoom("plus");
        };
    });

    minus?.addEventListener('click', () => {
        if (zoomAtual > 0) {
            zoomAtual--;
            mudarZoom("minus");
        };
    });

    // Relógio
    setInterval(() => {
        const hoje = new Date();
        let hora = verificaNumero(hoje.getHours());
        let minuto = verificaNumero(hoje.getMinutes());
        let segundo = verificaNumero(hoje.getSeconds());
        if(Clock) Clock.innerHTML = hora + ":" + minuto + ":" + segundo;
    }, 1000);

    function verificaNumero(variavel) {
        if (variavel < 10) variavel = "0" + variavel;
        return variavel;
    }

    const zoomNivel = [50, 67, 75, 90, 100, 110, 125, 133, 150];
    let zoomAtual = 4;
    const zoomPopUpID = 'zoomPopUpContainer';

    function mudarZoom(tipo) {
        const zoomValor = zoomNivel[zoomAtual];
        htmlElement.style.fontSize = `${zoomValor}%`;
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

    // --- API E LOGICA DO ÔNIBUS ---

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
                if (resposta.status === 404) throw new Error("Essa exibição não existe.");
                throw new Error("Não foi possível encontrar a exibição.");
            }
            return await resposta.json();
        } catch (error) {
            erroAnim();
            setTexto("Oops! Erro!!");
            setSubTexto(error.message);
        }
    };

    async function radarOnibus(codigosParada) { 
        const timestamp = Date.now();
        const onibusAtivos = new Set();
        const listaParaMapa = []; 

        try {
            const resposta = await fetch(`${vercel}/parada-radar?codigos=${codigosParada}`, {
                method: 'GET', 
                headers: { 'Content-Type': 'application/json' },
            });

            if (!resposta.ok) throw new Error("Erro na API");

            const dados = await resposta.json();
            
            dados.forEach(resumoParada => {
                const horaRequest = resumoParada.horaRequest;
                resumoParada.linhas.forEach(linha => {
                    if (linha.proximoOnibus) {
                        const { codigoLetreiro, sentidoLinha, quantidadeOnibus } = linha;
                        const { proximoOnibusCodigo, proximoOnibusPrevisao } = linha.proximoOnibus;

                        const lat = linha.proximoOnibus.py || linha.proximoOnibus.latitude;
                        const lng = linha.proximoOnibus.px || linha.proximoOnibus.longitude;

                        if (lat && lng) {
                            listaParaMapa.push({
                                prefixo: proximoOnibusCodigo,
                                latitude: lat,
                                longitude: lng,
                                linha: codigoLetreiro
                            });
                        }

                        escreveOnibus(proximoOnibusCodigo, codigoLetreiro, sentidoLinha, quantidadeOnibus, proximoOnibusPrevisao, horaRequest);
                        onibusAtivos.add(proximoOnibusCodigo);
                    }
                });
            });

            registroOnibus.forEach(function(value, key){
                if (!onibusAtivos.has(key)) registroOnibus.delete(key);
            })

            // MUDANÇA: Atualiza Mobile E Desktop
            atualizaInterface(onibusAtivos);

            if (window.atualizarMapa) window.atualizarMapa(listaParaMapa);

            const urlParams = new URLSearchParams(window.location.search);
            const codigoAtual = urlParams.get('codigo');
            if (codigoAtual) salvarBackupLocal(codigoAtual);

            fechaAnim();

        } catch (error) {
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

    // --- LÓGICA DE RENDERIZAÇÃO HÍBRIDA ---

    function getStatusInfo(value) {
        let promessa = converteHoraMinuto(value.Promessa);
        let atual = converteHoraMinuto(value.Previsao);
        let diferenca = atual - promessa;

        // Visual (Cores Tailwind)
        if (diferenca >= 2) {
            return { 
                texto: `Atrasado (${diferenca} min)`, 
                corBg: 'bg-amber-400', corBorda: 'border-amber-500', // Mobile
                corBadgeBg: 'bg-yellow-100', corBadgeTexto: 'text-yellow-700', corBadgeDot: 'bg-yellow-400' // Desktop
            };
        } else if (diferenca <= -2) {
             const adianto = Math.abs(diferenca);
             return { 
                 texto: `Adiantado (${adianto} min)`, 
                 corBg: 'bg-blue-400', corBorda: 'border-blue-500',
                 corBadgeBg: 'bg-blue-100', corBadgeTexto: 'text-blue-700', corBadgeDot: 'bg-blue-400'
             };
        } else {
            return { 
                texto: 'Normal', 
                corBg: 'bg-green-400', corBorda: 'border-green-500',
                corBadgeBg: 'bg-green-100', corBadgeTexto: 'text-green-700', corBadgeDot: 'bg-green-400'
            };
        }
    }

    function atualizaInterface(onibusAtivos) {
        // Atualiza Mobile E Desktop
        registroOnibus.forEach((value, codigo) => {
            // 1. Mobile
            gerenciarCardMobile(value, codigo);
            // 2. Desktop
            gerenciarLinhaDesktop(value, codigo);
        });

        limparItensAntigos(onibusAtivos);
        ordenarTudo();
    }

    // --- FUNÇÕES MOBILE (Cards) ---
    function gerenciarCardMobile(value, codigo) {
        let card = document.getElementById(`mobile-${codigo}`);
        if (!card) {
            constroiCardMobile(value, codigo);
        } else {
            atualizaCardMobile(card, value);
        }
    }

    function constroiCardMobile(value, codigo) {
        const status = getStatusInfo(value);
        const card = document.createElement('div');
        card.id = `mobile-${codigo}`;
        card.className = "flex w-full bg-white border-4 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-200 animate-fadeIn nome-linha-container";

        card.innerHTML = `
            <div class="w-1/3 bg-gray-200 border-r-4 border-black flex flex-col justify-center items-center p-2 text-center">
                <span class="text-2xl sm:text-3xl font-extrabold font-mono text-black block leading-none mb-1">${value.Letreiro}</span>
                <span class="text-xl sm:text-2xl font-bold font-mono text-gray-700 block previsao-texto">${value.Previsao}</span>
            </div>
            <div class="w-2/3 flex flex-col justify-between">
                <div class="p-3 flex items-center h-full">
                    <span class="text-lg sm:text-xl font-extrabold uppercase leading-tight line-clamp-2 text-black nome-linha">
                        ${value.NomeSentido}
                    </span>
                </div>
                <div class="status-bar ${status.corBg} border-t-4 border-black py-1.5 px-2 text-center">
                    <span class="text-sm sm:text-base font-bold text-black flex items-center justify-center gap-1 status-texto">
                        • ${status.texto}
                    </span>
                </div>
            </div>
        `;
        if(listaMobile) listaMobile.appendChild(card);
    }

    function atualizaCardMobile(card, value) {
        const status = getStatusInfo(value);
        card.querySelector('.previsao-texto').textContent = value.Previsao;
        const statusBar = card.querySelector('.status-bar');
        const statusTexto = card.querySelector('.status-texto');
        statusBar.className = `status-bar ${status.corBg} border-t-4 border-black py-1.5 px-2 text-center`;
        statusTexto.textContent = `• ${status.texto}`;
    }

    // --- FUNÇÕES DESKTOP (Tabela) ---
    function gerenciarLinhaDesktop(value, codigo) {
        let tr = document.getElementById(`desktop-${codigo}`);
        if (!tr) {
            constroiLinhaDesktop(value, codigo);
        } else {
            atualizaLinhaDesktop(tr, value);
        }
    }

    function constroiLinhaDesktop(value, codigo) {
        const status = getStatusInfo(value);
        const tr = document.createElement('tr');
        tr.id = `desktop-${codigo}`;
        tr.className = "border-b hover:bg-gray-50 transition animate-fadeIn";

        tr.innerHTML = `
            <td class="text-center py-4 px-6 font-extrabold font-mono text-2xl">${value.Letreiro}</td>
            <td class="text-center py-4 px-6 font-bold text-gray-800 nome-linha">${value.NomeSentido}</td>
            <td class="text-center py-4 px-6 font-mono font-bold text-2xl previsao-texto">${value.Previsao}</td>
            <td class="text-center py-4 px-6 status-cell">
                <span class="inline-flex items-center px-3 py-1 rounded-full ${status.corBadgeBg} ${status.corBadgeTexto} font-bold text-lg">
                    <span class="relative flex w-3 h-3 mr-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${status.corBadgeDot} opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-3 w-3 ${status.corBadgeDot}"></span>
                    </span>
                    ${status.texto}
                </span>
            </td>
        `;
        if(tabelaDesktop) tabelaDesktop.appendChild(tr);
    }

    function atualizaLinhaDesktop(tr, value) {
        const status = getStatusInfo(value);
        tr.querySelector('.previsao-texto').textContent = value.Previsao;
        const cell = tr.querySelector('.status-cell');
        
        cell.innerHTML = `
            <span class="inline-flex items-center px-3 py-1 rounded-full ${status.corBadgeBg} ${status.corBadgeTexto} font-bold text-lg">
                <span class="relative flex w-3 h-3 mr-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${status.corBadgeDot} opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 ${status.corBadgeDot}"></span>
                </span>
                ${status.texto}
            </span>
        `;
    }

    // --- LIMPEZA E ORDENAÇÃO GERAL ---

    function limparItensAntigos(onibusAtivos) {
        // Limpa Mobile
        if(listaMobile) {
            Array.from(listaMobile.children).forEach(el => {
                const codigo = el.id.split('-')[1];
                if (!onibusAtivos.has(codigo)) el.remove();
            });
        }
        // Limpa Desktop
        if(tabelaDesktop) {
            Array.from(tabelaDesktop.children).forEach(el => {
                const codigo = el.id.split('-')[1];
                if (!onibusAtivos.has(codigo)) el.remove();
            });
        }
    }

    function ordenarTudo() {
        const criterio = filtroSelect.value;
        if (criterio === 'padrao') return;

        // Função genérica de sort
        const sortFunc = (a, b) => {
            if (criterio === 'nome') {
                const nomeA = a.querySelector('.nome-linha').innerText;
                const nomeB = b.querySelector('.nome-linha').innerText;
                return nomeA.localeCompare(nomeB);
            } else if (criterio === 'tempo') {
                const tempoA = a.querySelector('.previsao-texto').innerText;
                const tempoB = b.querySelector('.previsao-texto').innerText;
                return tempoA.localeCompare(tempoB);
            }
            return 0;
        };

        // Ordena Mobile
        if(listaMobile) {
            const mobiles = Array.from(listaMobile.children);
            mobiles.sort(sortFunc);
            mobiles.forEach(el => listaMobile.appendChild(el));
        }

        // Ordena Desktop
        if(tabelaDesktop) {
            const desktops = Array.from(tabelaDesktop.children);
            desktops.sort(sortFunc);
            desktops.forEach(el => tabelaDesktop.appendChild(el));
        }
    }

    function converteHoraMinuto(horaMinuto) {
        if(!horaMinuto) return 0;
        const hmSeparado = horaMinuto.split(':');
        let hora = parseInt(hmSeparado[0]) * 60;
        let minuto = parseInt(hmSeparado[1]);
        return hora + minuto;
    }

    // --- BACKUP ---
    function salvarBackupLocal(codigoExibicao) {
        const dadosArray = Array.from(registroOnibus.entries());
        const backup = { codigoExibicao, timestamp: Date.now(), dados: dadosArray };
        localStorage.setItem('backupOnibus', JSON.stringify(backup));
    }

    function carregarBackupLocal(codigoExibicaoAtual) {
        const backupString = localStorage.getItem('backupOnibus');
        if (backupString) {
            const backup = JSON.parse(backupString);
            if (backup.codigoExibicao === codigoExibicaoAtual) {
                backup.dados.forEach(([key, value]) => registroOnibus.set(key, value));
                const chavesRecuperadas = new Set(registroOnibus.keys());
                atualizaInterface(chavesRecuperadas);
            }
        }
    }
});