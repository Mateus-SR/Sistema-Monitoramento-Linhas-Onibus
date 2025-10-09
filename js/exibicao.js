document.addEventListener('DOMContentLoaded', () => {

    const vercel = 'https://sistema-monitoramento-linhas-onibus.vercel.app';
    radarOnibus();
    setInterval(radarOnibus, 5000);

    const htmlElement = document.documentElement;

    const HideBtn = document.getElementById("hideBtn1");
    const HideElement = document.getElementById("hideElement1");
    const Clock = document.getElementById("horas");
    const minus = document.getElementById('minus');
    const plus = document.getElementById('plus');
    const minusPlus = document.getElementById('minusPlus');


    const HideBtnText = document.getElementById('HideBtnText');
    let isHidden = false;

    HideBtn.addEventListener('click', () => {
        HideElement.classList.toggle('-translate-y-full');
        // minusPlus.classList.toggle('-translate-x-full');

        isHidden = HideElement.classList.contains('-translate-y-full');

        if (isHidden) {
            HideBtnText.classList.remove('fa-chevron-up');
            HideBtnText.classList.add('fa-chevron-down');
        } else {
            HideBtnText.classList.remove('fa-chevron-down');
            HideBtnText.classList.add('fa-chevron-up');
        }
    });

    setInterval(() => {
        // Pega a data de agora
        const hoje = new Date();

        // Quebra a data em pedaços menores
        let hora = hoje.getHours();
        let minuto = hoje.getMinutes();
        let segundo = hoje.getSeconds();

        // Ajusta horarios que começam com 0
        hora = verificaNumero(hora);
        minuto = verificaNumero(minuto);
        segundo = verificaNumero(segundo);

        Clock.innerHTML = hora + ":" + minuto + ":" + segundo;
    }, 1000)

    // Sendo [numero] menor que 10, concatena "0" no começo
    function verificaNumero(variavel) {
        if (variavel < 10) {
            variavel = "0" + variavel
        };
        return variavel;
    }


    function mudarZoom() {
        // Declara "zoomValor" como sendo o mesmo valor de "zoomNivel" na posição de "zoomAtual"
        const zoomValor = zoomNivel[zoomAtual];

        // Altera tag <html> adicionando font-size com o mesmo valor na variavel "zoomValor" como parametro porcentagem
        htmlElement.style.fontSize = `${zoomValor}%`;

        if (zoomAtual === 0) {
            // Caso o zoomAtual seja posição 0 (no caso, 50% de zoom)...
            // remove animação hover do botão -
            minus.classList.remove('hover:text-sptrans');
            // minus.classList.add('cursor-not-allowed');

        } else if (zoomAtual === zoomNivel.length - 1) {
            // Caso o zoomAtual seja igual ao tamanho do array zoomNivel (9 espaços) menos 1 (8 espaços)...
            // remove animação hover do botão +
            // (Esse calculo é feito porque a posição de um array começa em 0, ou seja, um array de 9 espaços tem
            // de 0 até 8 posições: [0, 1, 2, 3, 4, 5, 6, 7, 8])
            plus.classList.remove('hover:text-sptrans');
            // plus.classList.add('cursor-not-allowed');
        } else {
            // Caso não seja nenhum dos casos acima, adiciona a animação hover nos botões
            minus.classList.add('hover:text-sptrans');
            plus.classList.add('hover:text-sptrans');
            // plus.classList.remove('cursor-not-allowed');
        }
    };

    // Variavel configurando todas as possibilidades de zoom
                    // [0]-[1]-[2]-[3]-[4]--[5]--[6]--[7]--[8]
    const zoomNivel = [50, 67, 75, 90, 100, 110, 125, 133, 150];
    let zoomAtual = 4; //              ^ esse aqui (5º espaço, posição numero 4)
    //  ^ Declarando o valor inicial, mas depois será usado para declarar o valor atual

    // Atualiza (adiciona) zoom assim que o botão + é clicado
    plus.addEventListener('click', () => {
    // Se zoomAtual é menor que o máximo de posições do array [ler explicação no mudarZoom()], então pode aumentar zoom
        if (zoomAtual < zoomNivel.length - 1) {
            zoomAtual++;
            mudarZoom();
        };
    });

    // Atualiza (subtrai) zoom assim que o botão - é clicado
    minus.addEventListener('click', () => {
        // Se zoomAtual é maior que 0 (minimo), então pode tirar zoom
        if (zoomAtual > 0) {
            zoomAtual--;
            mudarZoom();
        };
    });

/*#######################################################################################################
Seção da API, node, vercel, e afins
#######################################################################################################*/
 
    async function radarOnibus() { 
        const timestamp = Date.now();
    
        try {
            console.log(`${timestamp}: rodando bloco try.`);

            const response = await fetch (`${vercel}/parada-radar`);
            const dados = await response.json();

            const tabelaBody = document.getElementById('tabelaBody');
            tabelaBody.innerHTML = '';
            
            const horaRequest = dados.horaRequest;

            dados.resumoPesquisa1.linhas.forEach(linhas => {
                if (linhas.proximoOnibus) {
                const codigoLetreiro = linhas.codigoLetreiro;
                const sentidoLinha = linhas.sentidoLinha;
                const quantidadeOnibus = linhas.quantidadeOnibus;
                const proximoOnibusCodigo = linhas.proximoOnibus.proximoOnibusCodigo;
                const proximoOnibusPrevisao = linhas.proximoOnibus.proximoOnibusPrevisao;
                const proximoOnibusPosicaoX = linhas.proximoOnibus.proximoOnibusPosicaoX;
                const proximoOnibusPosicaoY = linhas.proximoOnibus.proximoOnibusPosicaoY;
                
                constroiTabela(codigoLetreiro, sentidoLinha, quantidadeOnibus, proximoOnibusCodigo, proximoOnibusPrevisao, proximoOnibusPosicaoX, proximoOnibusPosicaoY);

                }
            });

            dados.resumoPesquisa2.linhas.forEach(linhas => {
                if (linhas.proximoOnibus) {
                const codigoLetreiro = linhas.codigoLetreiro;
                const sentidoLinha = linhas.sentidoLinha;
                const quantidadeOnibus = linhas.quantidadeOnibus;
                const proximoOnibusCodigo = linhas.proximoOnibus.proximoOnibusCodigo;
                const proximoOnibusPrevisao = linhas.proximoOnibus.proximoOnibusPrevisao;
                const proximoOnibusPosicaoX = linhas.proximoOnibus.proximoOnibusPosicaoX;
                const proximoOnibusPosicaoY = linhas.proximoOnibus.proximoOnibusPosicaoY;
                
                
                constroiTabela(codigoLetreiro, sentidoLinha, quantidadeOnibus, proximoOnibusCodigo, proximoOnibusPrevisao, proximoOnibusPosicaoX, proximoOnibusPosicaoY);
                }
            });
        }

        catch (error) {
            console.error(`${timestamp}: erro (${error}) ao rodar bloco try.`);
        }
    }

    function constroiTabela(codigoLetreiro, sentidoLinha, quantidadeOnibus, proximoOnibusCodigo, proximoOnibusPrevisao, proximoOnibusPosicaoX, proximoOnibusPosicaoY) {
        
        const novaLinha = document.createElement('tr'); 
        novaLinha.className = "border-b hover:bg-gray-50";

        novaLinha.innerHTML = `
            <td class="text-center py-3 px-6 font-extrabold">${codigoLetreiro}</td>
            <td class="text-center py-3 px-6 ">${sentidoLinha}</td>
            <td class="text-center py-3 px-6 ">${proximoOnibusPrevisao}</td>`

            constroiStatus(novaLinha);
          
        tabelaBody.appendChild(novaLinha);
    };

    function constroiStatus(novaLinha) {
        return novaLinha.innerHTML += `
        <td class="text-center py-3 px-6">
            <span class="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm lg:text-2xl">
                <span class="relative flex w-2 h-2 mr-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                </span>Normal
            </span></td>`
    }
});
