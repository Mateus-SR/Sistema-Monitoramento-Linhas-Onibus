import {
    iniciaAnim,
    fechaAnim,
    setTexto,
    setSubTexto,
    erroAnim,
    setSimNao
} from './loadingAnim.js';

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

            //carregarBackupLocal(codigoExibicao); 

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
        zoomPopUp.addEventListener('animationend', () => zoomPopUp.remove(), {
            once: true
        });
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



    // Função async, pois o codigo precisa esperar tudo terminar para prosseguir
    async function radarOnibus(codigosParada) {
        // Pegando o tempo como timestamp apenas para referencia no console.log
        const timestamp = Date.now();

        // Criando uma nova "lista" (no caso, é um Set, mas releve)
        // Aqui, aparecerão apenas os onibus que ainda não passaram pelo ponto e ainda estão aparecendo na api
        const onibusAtivos = new Set();

        // --- NOVO: Array para guardar dados que vão para o mapa ---
        const listaParaMapa = [];

        // Parte central da função, onde tentamos pegar as informações
        // (Se não conseguimos, vamos pro "catch (error)" ali em baixo)
        try {
            // Console.log apenas para checar se estamos conseguindo rodar essa parte do codigo
            console.log(`${timestamp}: rodando bloco try.`);

            // Pedimos todo o bloco de informações (que ja filtramos la no servidor)
            const resposta = await fetch(`${vercel}/parada-radar?codigos=${codigosParada}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!resposta.ok) {
                let errorMsg = `Erro ${resposta.status} do servidor.`;
                try {
                    // Vamos tentar ler a mensagem de erro que o backend enviou
                    const errorData = await resposta.json();
                    // Se o backend enviou {error: "..."}, vamos usar essa mensagem
                    errorMsg = errorData.error || errorMsg;
                } catch (e) {
                    // Se o erro 500 não for um JSON, apenas usamos a mensagem de status
                }
                // Isso vai PARAR a execução do try e pular direto para o catch
                throw new Error(errorMsg);
            }

            // E quebramos ele, para ler como um arquivo .json
            const dados = await resposta.json();
            console.log('Dados recebidos do backend:', dados);

            // Resgatando/separando cada informação que recebemos no bloco de informações...
            // ...para utilizar nos respectivos lugares (inserir na tabela, realizar comparações)
            dados.forEach(resumoParada => {
                // IMPORTANTE: ^ Repare naquilo
                // Isso quer dizer que vamos fazer tudo isso aqui para cada onibus que pudermos achar na resposta (bloco) que a api nos deu
                const horaRequest = resumoParada.horaRequest;
                resumoParada.linhas.forEach(linha => {
                    if (linha.proximoOnibus) { // Verificação simples pra só fazermos isso se tivermos informações de verdade
                        const codigoLetreiro = linha.codigoLetreiro;
                        const sentidoLinha = linha.sentidoLinha;
                        const quantidadeOnibus = linha.quantidadeOnibus;
                        const proximoOnibusCodigo = linha.proximoOnibus.proximoOnibusCodigo;
                        const proximoOnibusPrevisao = linha.proximoOnibus.proximoOnibusPrevisao;

                        const lat = linha.proximoOnibus.proximoOnibusPosicaoX;
                        const lng = linha.proximoOnibus.proximoOnibusPosicaoY;
                        // Observação: restaurei essa parte para o modo antigo de pegar o X e Y porque ".latitude" ou ".longitude" não existem na api da Sptrans, apenas "px" e "py".
                        // Backend manda eles como proximoOnibusPosicaoX e proximoOnibusPosicaoY 


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

                        // Registrar nosso onibus na lista de Registros (não confundir com Ativos), para sabermos se ele ainda existe no sistema
                        escreveOnibus(proximoOnibusCodigo, codigoLetreiro, sentidoLinha, quantidadeOnibus, proximoOnibusPrevisao, horaRequest);

                        // Adicionamos o onibus na lista de Ativos (não confundir com Registros)
                        onibusAtivos.add(proximoOnibusCodigo);
                    }
                });
            });

            // Terminando as separações e construções...
            // Conferimos nossos onibus no console...
            console.log('Registro dos Onibus: ', registroOnibus);

            // ...e removemos os onibus que sairam da lista de Registros
            // IMPORTANTE: essa lista (Registros) serve para ser o nosso controle, especialmente dos horarios: a promessa, e a previsão...
            // ...a lista de Ativos serve para controlar os que entram e saem. Se um onibus saiu daqui, quer dizer que não precisamos mais
            // guardar as informações dele na lista de Registros. Se ele ainda está aqui, então ainda precisamos das informações dele.
            // (por quê? Se não fosse assim, estariamos para sempre guardando conosco informações de TODOS OS ONIBUS que o sistema já pegou!)
            registroOnibus.forEach(function (value, key) {
                if (!onibusAtivos.has(key)) {
                    registroOnibus.delete(key);
                }
            })

            preparaTabela(onibusAtivos);

            //  Envia a lista processada para o mapa.js
            if (window.atualizarMapa) {
                window.atualizarMapa(listaParaMapa);
            }

            // Lógica de Backup (mantive igual ao seu original)
            const urlParams = new URLSearchParams(window.location.search);
            const codigoAtual = urlParams.get('codigo');
            if (codigoAtual) {
                salvarBackupLocal(codigoAtual);
            }

            fechaAnim();

            // Caso qualquer falha tenha acontecido durante o try, vamos ser jogados aqui, e o console informará qual erro aconteceu
        } catch (error) {
            erroAnim();
            setTexto("Oops! Erro!!");
            setSubTexto(`Um erro (${error}) ocorreu.`)
            console.error(`${timestamp}: erro (${error}) ao rodar bloco try.`);
        }
    }

    // A função para colocar os onibus na lista de Registros (junto de informações uteis)
    function escreveOnibus(proximoOnibusCodigo, codigoLetreiro, sentidoLinha, quantidadeOnibus, proximoOnibusPrevisao, horaRequest) {
        // Como essa lista de Registros é um map(), ele funciona como um dicionario:
        // temos nossa "chave" e nosso "valor". No caso, a "chave" seria a palavra do dicionario que estamos procurando...
        // e o "valor" literalmente são as informações a respeito da palavra

        // Aqui, vamos verificar se o onibus que recebemos já está ou não na lista de onibus existentes
        // "registroOnibus.has(proximoOnibusCodigo)" é uma verificação que coloca "true" ou "false" dentro de "onibusExistente"
        const onibusExistente = registroOnibus.has(proximoOnibusCodigo)
        // Criamos um objeto/conjunto de informações (explico melhor ali em baixo)
        const onibusRegistroInfo = {
            Letreiro: codigoLetreiro,
            NomeSentido: sentidoLinha,
            QntdOnibus: quantidadeOnibus,
            Promessa: proximoOnibusPrevisao,
            Previsao: proximoOnibusPrevisao,
            DataPedido: horaRequest
        };

        // Caso o onibus que recebemos não exista na nossa lista, então vamos adicionar ele!
        if (!onibusExistente) {
            registroOnibus.set(proximoOnibusCodigo, onibusRegistroInfo)
            // Vê como adicionamos (set, não confundir com a lista do tipo "Set()") apenas duas coisas na nossa lista?
            // map() recebe apenas 2 parametros por item: a chave e o valor (no singular).
            // Se queremos colocar mais valores, precisamos fazer isso atráves de um objeto com todos os outros...
            // ...mas aí, precisaremos quebrar esse objeto para resgatar os valores de dentro dele
        } else {
            const fichaAntiga = registroOnibus.get(proximoOnibusCodigo);
            fichaAntiga.Previsao = proximoOnibusPrevisao;
            registroOnibus.set(proximoOnibusCodigo, fichaAntiga);
        };
    }

    function preparaTabela(onibusAtivos) {
        // Achamos nossa tabela e limpamos ela, preparando para as informações
        const tabelaBody = document.getElementById('tabelaBody');
        //tabelaBody.innerHTML = '';

        registroOnibus.forEach((value, proximoOnibusCodigo) => {
            let linhaExistente = document.getElementById(`onibus-${proximoOnibusCodigo}`);

            if (!linhaExistente) {
                constroiTabela(value, proximoOnibusCodigo)
            } else {
                const celulaPrevisao = linhaExistente.querySelector('.previsao');
                celulaPrevisao.textContent = value.Previsao;

                const celulaStatus = linhaExistente.querySelector('.status');
                const novoStatus = constroiStatus(value);

                celulaStatus.outerHTML = novoStatus;
            }
        })

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

    // A função que chamamos lá em cima para construir a tabela, recebendo as informações que vamos usar
    function constroiTabela(value, proximoOnibusCodigo) {
        //const onibusRegistroInfo = registroOnibus.get(proximoOnibusCodigo);

        const codigoLetreiro = value.Letreiro;
        const sentidoLinha = value.NomeSentido;
        const quantidadeOnibus = value.QntdOnibus;
        
        const proximoOnibusPrevisao = value.Previsao;
        const horaRequest = value.DataPedido;



        // criamos nossa linha da tabela (uma por vez, o appendChild adiciona uma nova linha na tabela)
        const novaLinha = document.createElement('tr'); 
        novaLinha.className = "border-b hover:bg-gray-50";
        novaLinha.id = `onibus-${proximoOnibusCodigo}`

        const celulaLinhas = `
            <td class="text-center py-3 px-6 font-extrabold">${codigoLetreiro}</td>
            <td class="text-center py-3 px-6 ">${sentidoLinha}</td>
            <td class="text-center py-3 px-6 previsao">${proximoOnibusPrevisao}</td>`

        // Terminando de construir a linha, vamos construir o status
        const celulaStatus = constroiStatus(value, proximoOnibusCodigo);
        
        novaLinha.innerHTML = celulaLinhas + celulaStatus

        novaLinha.classList.add('animate-fadeIn');

        novaLinha.addEventListener('animationend', () =>{
            novaLinha?.classList.remove('animate-fadeIn');
        }, {once: true});


        const filtroAtual = input.value.toLowerCase();
        if (filtroAtual) {
            const textoDaLinha = novaLinha.textContent.toLowerCase();
            if (!textoDaLinha.includes(filtroAtual)) {
                novaLinha.style.display = 'none';
            }
        }

        // Colocamos a linha na tabela
        tabelaBody.appendChild(novaLinha);
    };

    function constroiStatus(value) {
        // Recebemos as informações do "dicionario" (lista de Registros)
        //const promessaGuardada = registroOnibus.get(proximoOnibusCodigo);

        // Como nós colocamos mais de uma informação aonde só poderia ter uma unica...
        // ...vamos ter que pegar apenas o que queremos agora (no caso, a Previsão)
        let horarioPrevistoPromessa = converteHoraMinuto(value.Promessa);
        let horarioPrevistoAtual = converteHoraMinuto(value.Previsao);
        // Nessas duas variaveis em cima, estamos jogando horarios (promessa e previsão) em uma função que transforma o horario em minutos
        // Explicação: 22:40 vira 22 horas e 40 minutos. Por quê? Não podemos trabalhar com horas e minutos ao mesmo tempo.
        // Então? Vamos transformar tudo em minutos (pra não ter que trabalhar com decimais):
        // 22 horas viram 1320 minutos, somando com os 40 que ja eram minutos = 1360 minutos

        // Pra que esse trabalho todo? Para sabermos a diferença, em minutos, entre o horario da promessa e o horario da previsao
        let diferencaPrevisoes = horarioPrevistoAtual - horarioPrevistoPromessa;

        // Passando essa conversão, temos aqui os valores dos status
        var statusCor = "green"; // é o default
        var statusTexto = "Normal"; // é o default

        // Sendo a diferença entre a promessa e a previsao MAIOR OU IGUAL a 2 minutos, estamos atrasados
        // (Previsão 22:42 (1362), Promessa: 22:40 (1360) = Atrasado)
        // (1362 - 1360 = 2)
        if (diferencaPrevisoes >= 2) {
            statusCor = "yellow";
            statusTexto = "Atrasado"; 
            registrarIncidente(value.Letreiro, proximoOnibusCodigo, "Atrasado", diferencaPrevisoes);
        // Sendo a diferença entre a promessa e a previsao MENOR OU IGUAL a 2 minutos NEGATIVOS, estamos adiantados
        // (Previsão 22:38 (1358), Promessa: 22:40 (1360) = Adiantado)
        // (1358 - 1360 = -2)
        } else if (diferencaPrevisoes <= -2) {
            statusCor = "blue";
            statusTexto = "Adiantado"; 
            registrarIncidente(value.Letreiro, proximoOnibusCodigo, "Adiantado", diferencaPrevisoes);
        }
        
        /* DEBUG Apenas para verificar as informações que estamos guardando
        console.log(`Onibus: ${proximoOnibusCodigo}`);
        console.log(`promessaGuardada: ${promessaGuardada}`);
        console.log(`horarioPrevistoPromessa: ${horarioPrevistoPromessa}`);
        console.log(`horarioPrevistoAtual: ${horarioPrevistoAtual}`);
        console.log(`diferencaPrevisoes: ${diferencaPrevisoes}`);
        */ 

        // Enfim, construimos o status adicionando ele na tabela, devidamente customizado. Mas como?
        // Repare que no lugar do CSS aonde deveriam estar classes do tailwind para customizar a cor (bg-green-100, por exemplo)...
        // ...nós temos uma variavel (bg-${statusCor}-100). Como assim??

        // O javascript roda "em tempo real" e, se o valor da nossa variavel "statusCor" é "green" (veja ali em cima!)...
        // ...ele automaticamente pensa que deve escrever bg-green-100! E se for "yellow"...? Ele vai ler bg-yellow-100!
        // (isso só é possivel por causa que estamos inserindo um html através de um "template string". São os acentos: ``)
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

    // Função para quebrar horarios e transformar eles totalmente em minutos
    function converteHoraMinuto(horaMinuto) {
        // Recebemos o horario e quebramos ele aonde tem o dois pontos (22:40 = array com 22 e 40 = [22, 40])
        const hmSeparado = horaMinuto.split(':');

        // Chamamos de "hora" o que estiver na posição 0 e garantimos que é um numero (.split é um metodo de string)
        let hora = parseInt(hmSeparado[0]);
        // e transformamos em minutos ao multiplicar por 60
        hora = hora * 60;
  
        // Chamamos de "minuto" o que estiver na posição 1 e garantimos que é um numero (.split é um metodo de string)
        // Não precisamos transformar em minutos porque... razões óbvias
        let minuto = parseInt(hmSeparado[1]);

        // Somamos os dois e devolvemos lá pra cima, para ver a diferença
        let resultado = hora + minuto;
        return resultado;
    }

    async function registrarIncidente(nome, proximoOnibusCodigo, status, diferenca) {
        const token = localStorage.getItem('tokenLogin');
        const headers = {
            'Content-Type': 'application/json'
        };
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

    function ordenarTabela() {
        const criterio = filtroSelect ? filtroSelect.value : 'padrao';
        if (criterio === 'padrao') return;

        // Pega as linhas atuais
        const linhasAtuais = Array.from(tabelaBody.getElementsByTagName('tr'));

        // Cria uma cópia para ordenar (para não mexer no DOM ainda)
        const linhasOrdenadas = [...linhasAtuais].sort((a, b) => {
            if (criterio === 'nome') {
                const nomeA = a.cells[1].innerText.trim();
                const nomeB = b.cells[1].innerText.trim();
                return nomeA.localeCompare(nomeB);
            } else if (criterio === 'tempo') {
                const tempoA = a.cells[2].innerText.trim();
                const tempoB = b.cells[2].innerText.trim();
                return tempoA.localeCompare(tempoB);
            }
            return 0;
        });

        let precisaReordenar = false;
        for (let i = 0; i < linhasAtuais.length; i++) {
            if (linhasAtuais[i] !== linhasOrdenadas[i]) {
                precisaReordenar = true;
                break;
            }
        }

        if (precisaReordenar) {
            linhasOrdenadas.forEach(linha => tabelaBody.appendChild(linha));
        }
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