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
        const zoomValor = zoomNivel[zoomAtual];
        htmlElement.style.fontSize = `${zoomValor}%`;

        if (zoomAtual === 0) {
            minus.classList.remove('hover:text-sptrans');
            // minus.classList.add('cursor-not-allowed');
        } else if (zoomAtual === zoomNivel.length - 1) {
            plus.classList.remove('hover:text-sptrans');
            // plus.classList.add('cursor-not-allowed');
        } else {
            minus.classList.add('hover:text-sptrans');
            plus.classList.add('hover:text-sptrans');
            // plus.classList.remove('cursor-not-allowed');
        }
    };

    const zoomNivel = [50, 67, 75, 90, 100, 110, 125, 133, 150];
    let zoomAtual = 4; // ^ esse aqui

    plus.addEventListener('click', () => {
            if (zoomAtual < zoomNivel.length - 1) {
                zoomAtual++;
                mudarZoom();
            };
        }),

        minus.addEventListener('click', () => {
            if (zoomAtual > 0) {
                zoomAtual--;
                mudarZoom();
            };
        })
});