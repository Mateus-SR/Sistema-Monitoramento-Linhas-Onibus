document.addEventListener('DOMContentLoaded', () => {

    // Precisamos dizer parao javascript o endereço do lugar para fazer as requisições
    const vercel = 'https://sistema-monitoramento-linhas-onibus.vercel.app';

    // Rodamos a função assim que a pagina abre e...
    radarOnibus();
    // ...configuramos para rodar a cada 5 segundos (5000 milessegundos)
    setInterval(radarOnibus, 5000);

    // Encontramos a tag <html>, para alterar seu zoom posteriormente
    const htmlElement = document.documentElement;

    // Criamos nossa lista de registros de onibus
    // (Aqui estarão as informações importantes e que devem ser permanentes enquanto o onibus "existir")
    const registroOnibus = new Map();

    // Pegando uma série de elementos na pagina, para fazer coisas depois
    const HideBtn = document.getElementById("hideBtn1");
    const HideElement = document.getElementById("hideElement1");
    const Clock = document.getElementById("horas");
    const minus = document.getElementById('minus');
    const plus = document.getElementById('plus');
    const minusPlus = document.getElementById('minusPlus');
    const HideBtnText = document.getElementById('HideBtnText');
    let isHidden = false;

    // Nessa função, configuramos a animação de esconder o menu
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

        // Atualiza a cada segundo
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
 
    // Função async, pois o codigo precisa esperar tudo terminar para prosseguir
    async function radarOnibus() { 
        // Pegando o tempo como timestamp apenas para referencia no console.log
        const timestamp = Date.now();
        
        // Criando uma nova "lista" (no caso, é um Set, mas releve)
        // Aqui, aparecerão apenas os onibus que ainda não passaram pelo ponto e ainda estão aparecendo na api
        const onibusAtivos = new Set();

        // Parte central da função, onde tentamos pegar as informações
        // (Se não conseguimos, vamos pro "catch (error)" ali em baixo)
        try {
            // Console.log apenas para checar se estamos conseguindo rodar essa parte do codigo
            console.log(`${timestamp}: rodando bloco try.`);

            // Pedimos todo o bloco de informações (que ja filtramos la no servidor)
            const response = await fetch (`${vercel}/parada-radar`);
            // E quebramos ele, para ler como um arquivo .json
            const dados = await response.json();

            // Achamos nossa tabela e limpamos ela, preparando para as informações
            const tabelaBody = document.getElementById('tabelaBody');
            tabelaBody.innerHTML = '';
            
            const horaRequest = dados.horaRequest;

            // Resgatando/separando cada informação que recebemos no bloco de informações...
            // ...para utilizar nos respectivos lugares (inserir na tabela, realizar comparações)
            dados.resumoPesquisa1.linhas.forEach(linhas => {
                // IMPORTANTE: Repare nisso ^
            // Isso quer dizer que vamos fazer tudo isso aqui para cada onibus que pudermos achar na resposta (bloco) que a api nos deu
                if (linhas.proximoOnibus) { // Verificação simples pra só fazermos isso se tivermos informações de verdade
                const codigoLetreiro = linhas.codigoLetreiro;
                const sentidoLinha = linhas.sentidoLinha;
                const quantidadeOnibus = linhas.quantidadeOnibus;
                const proximoOnibusCodigo = linhas.proximoOnibus.proximoOnibusCodigo;
                const proximoOnibusPrevisao = linhas.proximoOnibus.proximoOnibusPrevisao;
                const proximoOnibusPosicaoX = linhas.proximoOnibus.proximoOnibusPosicaoX;
                const proximoOnibusPosicaoY = linhas.proximoOnibus.proximoOnibusPosicaoY;
                
                // Registrar nosso onibus na lista de Registros (não confundir com Ativos), para sabermos se ele ainda existe no sistema
                escreveOnibus(proximoOnibusCodigo, codigoLetreiro, proximoOnibusPrevisao, horaRequest);

                // Estando tudo certo, construimos nossa tabela, inserindo cada coisa na sua respectiva célula
                constroiTabela(codigoLetreiro, sentidoLinha, quantidadeOnibus, proximoOnibusCodigo, proximoOnibusPrevisao, horaRequest);
                
                // Adicionamos o onibus na lista de Ativos (não confundir com Registros)
                onibusAtivos.add(proximoOnibusCodigo);
                }
            });

            // Essa seção é a mesma de cima, e só estamos repetindo essa parte de codigo para facilitar os testes...
            // ...futuramente, o ideal é que tenhamos apenas uma, dinamica, para comportar quantas pesquisas forem necessárias
            dados.resumoPesquisa2.linhas.forEach(linhas => {
                if (linhas.proximoOnibus) {
                const codigoLetreiro = linhas.codigoLetreiro;
                const sentidoLinha = linhas.sentidoLinha;
                const quantidadeOnibus = linhas.quantidadeOnibus;
                const proximoOnibusCodigo = linhas.proximoOnibus.proximoOnibusCodigo;
                const proximoOnibusPrevisao = linhas.proximoOnibus.proximoOnibusPrevisao;
                const proximoOnibusPosicaoX = linhas.proximoOnibus.proximoOnibusPosicaoX;
                const proximoOnibusPosicaoY = linhas.proximoOnibus.proximoOnibusPosicaoY;
                
                escreveOnibus(proximoOnibusCodigo, codigoLetreiro, proximoOnibusPrevisao, horaRequest);
                constroiTabela(codigoLetreiro, sentidoLinha, quantidadeOnibus, proximoOnibusCodigo, proximoOnibusPrevisao, horaRequest);

                onibusAtivos.add(proximoOnibusCodigo);
                }
            });

            // Terminando as separações e construções...
            // Conferimos nossos onibus no console...
            console.log('Registro dos Onibus: ', registroOnibus);

            // ...e removemos os onibus que sairam da lista de Registros
        // IMPORTANTE: essa lista (Registros) serve para ser o nosso controle, especialmente dos horarios: a promessa, e a previsão...
        // ...a lista de Ativos serve para controlar os que entram e saem. Se um onibus saiu daqui, quer dizer que não precisamos mais
        // guardar as informações dele na lista de Registros. Se ele ainda está aqui, então ainda precisamos das informações dele.
        // (por quê? Se não fosse assim, estariamos para sempre guardando conosco informações de TODOS OS ONIBUS que o sistema já pegou!)
            registroOnibus.forEach(function(value, key){
                if (!onibusAtivos.has(key)) {
                    registroOnibus.delete(key);
                }
            })
        }

        // Caso qualquer falha tenha acontecido durante o try, vamos ser jogados aqui, e o console informará qual erro aconteceu
        catch (error) {
            console.error(`${timestamp}: erro (${error}) ao rodar bloco try.`);
        }
    }

    // A função para colocar os onibus na lista de Registros (junto de informações uteis)
    function escreveOnibus(proximoOnibusCodigo, codigoLetreiro, proximoOnibusPrevisao, horaRequest) {
        // Como essa lista de Registros é um map(), ele funciona como um dicionario:
        // temos nossa "chave" e nosso "valor". No caso, a "chave" seria a palavra do dicionario que estamos procurando...
        // e o "valor" literalmente são as informações a respeito da palavra

        // Aqui, vamos verificar se o onibus que recebemos já está ou não na lista de onibus existentes
        // "registroOnibus.has(proximoOnibusCodigo)" é uma verificação que coloca "true" ou "false" dentro de "onibusExistente"
        const onibusExistente = registroOnibus.has(proximoOnibusCodigo)
        // Criamos um objeto/conjunto de informações (explico melhor ali em baixo)
        const onibusRegistroInfo = { 
            Letreiro: codigoLetreiro,
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
        };

    }


    // A função que chamamos lá em cima para construir a tabela, recebendo as informações que vamos usar
    function constroiTabela(codigoLetreiro, sentidoLinha, quantidadeOnibus, proximoOnibusCodigo, proximoOnibusPrevisao, horaRequest) {
        
        // criamos nossa linha da tabela (uma por vez, o appendChild adiciona uma nova linha na tabela)
        const novaLinha = document.createElement('tr'); 
        novaLinha.className = "border-b hover:bg-gray-50";

        novaLinha.innerHTML = `
            <td class="text-center py-3 px-6 font-extrabold">${codigoLetreiro}</td>
            <td class="text-center py-3 px-6 ">${sentidoLinha}</td>
            <td class="text-center py-3 px-6 ">${proximoOnibusPrevisao}</td>`

            // Terminando de construir a linha, vamos construir o status
            constroiStatus(novaLinha, horaRequest, proximoOnibusPrevisao, proximoOnibusCodigo);
        
        // Colocamos a linha na tabela
        tabelaBody.appendChild(novaLinha);
    };

    function constroiStatus(novaLinha, horaRequest, proximoOnibusPrevisao, proximoOnibusCodigo) {
        // Recebemos as informações do "dicionario" (lista de Registros)
        const promessaGuardada = registroOnibus.get(proximoOnibusCodigo);

        // Como nós colocamos mais de uma informação aonde só poderia ter uma unica...
        // ...vamos ter que pegar apenas o que queremos agora (no caso, a Previsão)
        let horarioPrevistoPromessa = converteHoraMinuto(promessaGuardada.Previsao);
        let horarioPrevistoAtual = converteHoraMinuto(proximoOnibusPrevisao);
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
        // Sendo a diferença entre a promessa e a previsao MENOR OU IGUAL a 2 minutos NEGATIVOS, estamos adiantados
        // (Previsão 22:38 (1358), Promessa: 22:40 (1360) = Adiantado)
        // (1358 - 1360 = -2)
        } else if (diferencaPrevisoes <= -2) {
            statusCor = "blue";
            statusTexto = "Adiantado"; 
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
        return novaLinha.innerHTML += `
        <td class="text-center py-3 px-6">
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
        resultado = hora + minuto;
        return resultado;
    }
});
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('barraPesquisa');
  const tabela = document.getElementById('tabelaBody');
  const linhas = tabela.getElementsByTagName('tr');

  input.addEventListener('input', () => {
    const filtro = input.value.toLowerCase();

    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i];
      const texto = linha.textContent.toLowerCase();
      linha.style.display = texto.includes(filtro) ? '' : 'none';
    }
  });
});
