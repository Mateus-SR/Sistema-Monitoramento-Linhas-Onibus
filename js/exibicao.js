document.addEventListener('DOMContentLoaded', () => {

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
    }),

    // Atualiza (subtrai) zoom assim que o botão - é clicado
    minus.addEventListener('click', () => {
        // Se zoomAtual é maior que 0 (minimo), então pode tirar zoom
        if (zoomAtual > 0) {
            zoomAtual--;
            mudarZoom();
        };
    })
});