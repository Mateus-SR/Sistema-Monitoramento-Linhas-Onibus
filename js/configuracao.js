document.addEventListener('DOMContentLoaded', () => {
    const ConfiguraçãoForm = document.getElementById('ConfiguraçãoForm');
    const botaoAdicionar = document.getElementById('botaoAdicionar');
    const botaoRemover = document.getElementById('botaoRemover');
    const paradaField = document.getElementById('paradaField');
    
    let counterFieldAdiciona = 1;

    botaoAdicionar.addEventListener('click', () =>{
        if (counterFieldAdiciona <= 4) {
            const novoParadaField = paradaField.cloneNode(true); 
            
            novoParadaField.id = 'paradaField_' + counterFieldAdiciona;
            ConfiguraçãoForm.appendChild(novoParadaField);
            counterFieldAdiciona++;
        }
    })

    botaoRemover.addEventListener('click', () => {
        if (counterFieldAdiciona >= 2) {
            counterFieldAdiciona--;
            let paradaFieldRecente = document.getElementById(`paradaField_${counterFieldAdiciona}`)
            
            paradaFieldRecente.style.animation = `LTR-FadeOut 0.2s ease-in-out`;

            paradaFieldRecente.addEventListener('animationend', () => {
                paradaFieldRecente.remove();
            });
        }
    })



});