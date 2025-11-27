import { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim, setSimNao } from './loadingAnim.js';


document.addEventListener('DOMContentLoaded', () => {
    const ConfiguraçãoForm = document.getElementById('ConfiguraçãoForm');
    const botaoAdicionar = document.getElementById('botaoAdicionar');
    const botaoRemover = document.getElementById('botaoRemover');
    const botaoSalvar = document.getElementById('botaoSalvar');
    const codParadaOG = document.getElementById('codParada_1');

    const vercel = `https://sistema-monitoramento-linhas-onibus.vercel.app`;
    
    let counterFieldAdiciona = 1;
    verificaEstado();

    botaoAdicionar.addEventListener('click', () =>{
        if (counterFieldAdiciona <= 4) {
            const novocodParada = codParadaOG.cloneNode(true);
            
            counterFieldAdiciona++;
            novocodParada.id = 'codParada_' + counterFieldAdiciona;
            
            novocodParada.value = '';

            if (novocodParada.classList.contains('bg-sptrans/25')) {
                novocodParada.classList.remove('bg-sptrans/25')
            };

            ConfiguraçãoForm.appendChild(novocodParada);

            verificaEstado();
        }
    });

    const campoCodErro = (input) => {
        input.classList.add('bg-sptrans/25');
    }

    const campoCodCorreto = (input) => {
        input.classList.remove('bg-sptrans/25');
    }


    botaoRemover.addEventListener('click', () => {
        if (counterFieldAdiciona >= 2) {

            let codParadaRecente = document.getElementById(`codParada_${counterFieldAdiciona}`)
            
            
            if (codParadaRecente) {
                counterFieldAdiciona--;
                codParadaRecente.classList.remove("animate-LTRfadeIn");
                codParadaRecente.classList.add("animate-LTRfadeOut");
                

                
                codParadaRecente.addEventListener('animationend', () => {
                    codParadaRecente.remove();
                    verificaEstado();
                }, { once: true });
            }
        }
    });

    botaoSalvar.addEventListener('click', (e) => {

        e.preventDefault();
        salvarExibicao();
    });

    ConfiguraçãoForm.addEventListener('input', (e) => {
        if (e.target.classList.contains('campoCodParada')) {
            const input = e.target;

            input.value = input.value.replace(/\D/g, '');
            
            if (input.value.length > 0 && (input.value.length !== 9 && input.value.length !== 7)) {
                campoCodErro(input);
            } else {
                campoCodCorreto(input);
            }
        }
    });

    ConfiguraçãoForm.addEventListener('focusout', (e) => {
        if (e.target.classList.contains('campoCodParada')) {
            const input = e.target;

            if (input.value.length > 0 && (input.value.length !== 9 && input.value.length !== 7)) {
                campoCodErro(input);
            } else {
                campoCodCorreto(input);
            }
        }
    });

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
};

async function salvarExibicao() {
    iniciaAnim();
    setTexto("Salvando configurações...");

    const tokenLogin = localStorage.getItem('tokenLogin');

    if (!tokenLogin) {
        erroAnim();
        setTexto("Oops! Erro!!");
        setSubTexto("Você não está logado. Por favor, faça login novamente.");
        return;
    }

    const nome = document?.getElementById('nomeExib').value;
    const todosCodigos = document.querySelectorAll('.campoCodParada');
    
    // --- CORREÇÃO AQUI ---
    // Pegamos os valores corretos do HTML atual
    const tempoAtrasoInput = document.getElementById('tempoAtraso');
    const tempoAdiantadoInput = document.getElementById('tempoAdiantado');
    const distanciaMinInput = document.getElementById('distanciaMinOnibus'); // Agora usamos este ID!

    // Define valores padrão caso algo falhe na leitura (fallback)
    const tempoAtraso = tempoAtrasoInput ? parseInt(tempoAtrasoInput.value) : 2;
    const tempoAdiantado = tempoAdiantadoInput ? parseInt(tempoAdiantadoInput.value) : 2;
    const distanciaMinima = distanciaMinInput ? parseInt(distanciaMinInput.value) : 5;
    // ---------------------

    const arrayCodigos = Array.from(todosCodigos).map(cadaUm => cadaUm.value).filter(v => v !== "");

    if (arrayCodigos.length === 0) {
        erroAnim();
        setTexto("Vazio!");
        setSubTexto("Adicione pelo menos um ponto de ônibus.");
        return;
    }

    try {
        const dados = { 
            nome_exibicao: nome,
            codigos_parada: arrayCodigos,
            // Enviamos a configuração correta para o Backend
            config: {
                tempo_atraso: tempoAtraso,
                tempo_adiantado: tempoAdiantado,
                distanciaMinOnibus: distanciaMinima 
            }
        };

        const resposta = await fetch(`${vercel}/cria-exibicao`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Token': `Bearer ${tokenLogin}`
            },
            body: JSON.stringify(dados), 
        });

        const dadosResposta = await resposta.json();

        if (resposta.ok) { 
            setTexto("Sucesso!");
            setSubTexto("Configuração salva!");

            const codigoCriado = dadosResposta.codigo_exib;
            const confirma = await setSimNao("Acessar", "Configurar Mais");
            
            if (confirma) {
                const siteUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
                window.location.href = `${siteUrl}exibicao.html?codigo=${codigoCriado}`;
            } else {
                location.reload();
            }
        } else {
            const erroMsg = dadosResposta.error;
            setTexto("Erro no servidor");
            setSubTexto(erroMsg);
            erroAnim();
        }
    } catch (error) {
        setTexto("Erro de Conexão");
        setSubTexto(`${error}`);
        erroAnim();
    };
};
             const LIMITES = {
  tempoAtraso: { min: 1, max: 5 },
  tempoAdiantado: { min: 1, max: 5 },
  distanciaMinOnibus: { min: 5, max: 60 }
};

// Impede letras, "e", símbolos e números gigantes
document.querySelectorAll("input[type='number']").forEach(campo => {

  campo.addEventListener("keydown", (e) => {
    const permitido = [
      "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"
    ];

    // permite teclas básicas
    if (permitido.includes(e.key)) return;

    // BLOQUEIA: e, E, +, -, ., ,
    if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
      e.preventDefault();
      return;
    }

    // só permite 0–9
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  });

  // bloquear colar texto inválido
  campo.addEventListener("paste", (e) => {
    const texto = e.clipboardData.getData("text");

    if (!/^\d+$/.test(texto)) {
      e.preventDefault();
    }
  });

  // corrigir valor enquanto digita
  campo.addEventListener("input", () => {
    const limite = LIMITES[campo.id];
    if (!limite) return;

    let val = campo.value;

    // remove qualquer coisa que não seja número
    val = val.replace(/\D/g, "");

    let n = parseInt(val);

    if (isNaN(n)) n = limite.min;
    if (n > limite.max) n = limite.max;
    if (n < limite.min) n = limite.min;

    campo.value = n;
  });
});

// seta para cima
document.querySelectorAll(".setaUp").forEach(btn => {
  btn.addEventListener("click", () => {
    const campo = document.getElementById(btn.dataset.target);
    if (!campo) return;

    const { min, max } = LIMITES[campo.id];
    const v = parseInt(campo.value) || min;

    campo.value = Math.min(v + 1, max);
  });
});

// seta para baixo
document.querySelectorAll(".setaDown").forEach(btn => {
  btn.addEventListener("click", () => {
    const campo = document.getElementById(btn.dataset.target);
    if (!campo) return;

    const { min, max } = LIMITES[campo.id];
    const v = parseInt(campo.value) || min;

    campo.value = Math.max(v - 1, min);
  });
});


});