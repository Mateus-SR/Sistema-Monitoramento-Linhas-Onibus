import { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim, setSimNao } from './loadingAnim.js';

document.addEventListener('DOMContentLoaded', () => {
    const botaoAcessar = document?.getElementById('botaoAcessar');
    const campoCodigo = document?.getElementById('campoCodigo');

    const campoCodErro = (input) => {
        input.classList.add('bg-sptrans/25');
        input.classList.remove('bg-white');

    }

    const campoCodCorreto = (input) => {
        input.classList.remove('bg-sptrans/25');
        input.classList.add('bg-white');

    }

    botaoAcessar.addEventListener('click', () => { 
        const codigo = campoCodigo.value;
        window.location.href = `../exibicao.html?codigo=${codigo}`;
    })

    campoCodigo.addEventListener('input', (e) => {
        if (e.target.classList.contains('campoCodParada')) {
            const input = e.target;

            input.value = input.value.replace(/\s/g, '');
            input.value = valor.replace(/[^A-Za-z0-9_-]/g, '');
            input.value = valor.substring(0, 6);
            
            if (input.value.length > 0 && input.value.length !== 6) {
                campoCodErro(input);
            } else {
                campoCodCorreto(input);
            }
        }
    });

    campoCodigo.addEventListener('focusout', (e) => {
        if (e.target.classList.contains('campoCodParada')) {
            const input = e.target;

            if (input.value.length > 0 && input.value.length !== 6) {
                campoCodErro(input);
            } else {
                campoCodCorreto(input);
            }
        }
    });

});