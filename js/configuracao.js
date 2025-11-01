document.addEventListener('DOMContentLoaded', () => {
    const ConfiguraçãoForm = document.getElementById('ConfiguraçãoForm');
    const botaoAdicionar = document.getElementById('botaoAdicionar');
    const botaoRemover = document.getElementById('botaoRemover');
    const paradaField = document.getElementById('paradaField');
    
    let counterFieldAdiciona = 1;
    verificaEstado();

    botaoAdicionar.addEventListener('click', () =>{
        if (counterFieldAdiciona <= 4) {
            const novoParadaField = paradaField.cloneNode(true); 
            
            counterFieldAdiciona++;
            novoParadaField.id = 'paradaField_' + counterFieldAdiciona;
            ConfiguraçãoForm.appendChild(novoParadaField);

            verificaEstado();
        }
    })

    botaoRemover.addEventListener('click', () => {
        if (counterFieldAdiciona >= 2) {

            let paradaFieldRecente = document.getElementById(`paradaField_${counterFieldAdiciona}`)
 
            
            if (paradaFieldRecente) {
                paradaFieldRecente.classList.remove("animate-LTRfadeIn");
                paradaFieldRecente.classList.add("animate-LTRfadeOut");


                
                paradaFieldRecente.addEventListener('animationend', () => {
                    paradaFieldRecente.remove();
                    counterFieldAdiciona--;
                    verificaEstado();
                }, { once: true });
            }
        }
    })

function verificaEstado() {
    if (counterFieldAdiciona == 5) {
        botaoAdicionar.classList.remove('text-black');
        botaoAdicionar.classList.add('text-gray-400');

        botaoAdicionar.classList.remove('hover:text-sptrans');
        
        botaoAdicionar.classList.remove('cursor-pointer');
        botaoAdicionar.classList.add('cursor-not-allowed');
    } else if (counterFieldAdiciona == 1) {
        botaoRemover.classList.remove('text-black');
        botaoRemover.classList.add('text-gray-400');

        botaoRemover.classList.remove('hover:text-sptrans');
        
        botaoRemover.classList.remove('cursor-pointer');
        botaoRemover.classList.add('cursor-not-allowed');
    } else {
        botaoAdicionar.classList.add('text-black');
        botaoAdicionar.classList.remove('text-gray-400');

        botaoAdicionar.classList.add('hover:text-sptrans');

        botaoAdicionar.classList.add('cursor-pointer');
        botaoAdicionar.classList.remove('cursor-not-allowed');


        botaoRemover.classList.add('text-black');
        botaoRemover.classList.remove('text-gray-400');

        botaoRemover.classList.add('hover:text-sptrans');

        botaoRemover.classList.add('cursor-pointer');
        botaoRemover.classList.remove('cursor-not-allowed');
    }
}

});