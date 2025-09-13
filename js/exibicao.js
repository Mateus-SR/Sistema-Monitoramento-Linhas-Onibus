document.addEventListener('DOMContentLoaded', () => {

    const HideBtn = document.getElementById("hideBtn1");
    const HideElement = document.getElementById("hideElement1");
    const Clock = document.getElementById("horas");

    const HideBtnText = document.getElementById('HideBtnText');
    let isHidden = false;

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
});