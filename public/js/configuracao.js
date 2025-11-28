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

    const tokenInput = document.getElementById('tokenApi');
    const tokenValor = tokenInput ? tokenInput.value.trim() : "";

    if (tokenValor) {
        setTexto("Validando token SPTrans...");
        
        // A. Valida na API da SPTrans
        const validacao = await fetch(`${vercel}/validar-token-manual`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: tokenValor })
        });

        if (!validacao.ok) {
            erroAnim();
            setTexto("Token Inválido!");
            setSubTexto("O token da SPTrans informado não autenticou.");
            return; // Para o processo
        }

        // B. Salva no Banco de Dados (Tabela Usuário)
        const update = await fetch(`${vercel}/update-sptrans-token`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Token': `Bearer ${tokenLogin}`
            },
            body: JSON.stringify({ token: tokenValor })
        });

        if (!update.ok) {
            console.error("Erro ao salvar token no banco");
            // Opcional: Avisar usuário ou seguir mesmo assim
        }
    }
    
    setTexto("Validando dados...");

    const tokenLogin = localStorage.getItem('tokenLogin') || sessionStorageStorage.getItem('tokenLogin');

    if (!tokenLogin) {
        erroAnim();
        setTexto("Oops! Erro!!");
        setSubTexto("Você não está logado. Por favor, faça login novamente.");
        return;
    }

    const nome = document?.getElementById('nomeExib').value;
    const todosCodigos = document.querySelectorAll('.campoCodParada');

    // --- [MUDANÇA 1] Captura os valores dos novos inputs ---
    const tempoAtrasoInput = document.getElementById('tempoAtraso');
    const tempoAdiantadoInput = document.getElementById('tempoAdiantado');
    const distanciaMinInput = document.getElementById('distanciaMinOnibus');

    // Define valores padrão se os campos estiverem vazios ou inválidos
    const tempoAtraso = tempoAtrasoInput ? parseInt(tempoAtrasoInput.value) : 2;
    const tempoAdiantado = tempoAdiantadoInput ? parseInt(tempoAdiantadoInput.value) : 2;
    const distanciaMinima = distanciaMinInput ? parseInt(distanciaMinInput.value) : 20; // Padrão 20min
    // -----------------------------------------------------------

    const promessasDeValidacao = Array.from(todosCodigos).map(cadaCampo => {
        const codigoDoPonto = cadaCampo.value;
        if (!codigoDoPonto) return Promise.resolve(true);

        return fetch(`${vercel}/ping-ponto?codigo=${codigoDoPonto}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Token': `Bearer ${tokenLogin}`
            }
        })
        .then(resposta => {
            if (resposta.ok) {
                campoCodCorreto(cadaCampo);
                return true;
            } else {
                campoCodErro(cadaCampo);
                return false;
            }
        })
        .catch(err => {
            console.error("Erro na validação fetch:", err);
            campoCodErro(cadaCampo);
            return false;
        });
    });

    const resultados = await Promise.all(promessasDeValidacao);
    const formularioValido = resultados.every(resultado => resultado === true);

    if (!formularioValido) {
        erroAnim();
        setTexto("Oops! Erro!!");
        setSubTexto("Um ou mais códigos são inválidos. Verifique os campos em vermelho.");
        return;
    }

    const arrayCodigos = Array.from(todosCodigos).map(cadaUm => cadaUm.value).filter(v => v !== "");

    if (arrayCodigos.length === 0) {
        erroAnim();
        setTexto("Vazio!");
        setSubTexto("Adicione pelo menos um ponto de ônibus.");
        return;
    }

    try {
        // --- [MUDANÇA 2] Envia o objeto 'config' junto com os dados ---
        const dados = { 
            nome_exibicao: nome,
            codigos_parada: arrayCodigos,
            config: {
                tempo_atraso: tempoAtraso,
                tempo_adiantado: tempoAdiantado,
                distanciaMinOnibus: distanciaMinima
            }
        };
        // -------------------------------------------------------------

        const resposta = await fetch(`${vercel}/cria-exibicao`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Token': `Bearer ${tokenLogin}`
            },
            body: JSON.stringify(dados), 
        });

        setTexto("Enviando dados...");

        const dadosResposta = await resposta.json();
        
        if (resposta.ok) { 
            setTexto("Exibição criada com sucesso!")
            setSubTexto("Gostaria de acessá-la agora?")

            const codigoCriado = dadosResposta.codigo_exib;

            const confirma = await setSimNao("Acessar", "Depois");
            if (confirma) {
                const siteUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
                window.location.href = `${siteUrl}exibicao.html?codigo=${codigoCriado}`;
            } else {
                location.reload(); 
            }
        
        } else {
            const erroMsg = dadosResposta.error;
            setTexto("Oops! Erro!!");
            setSubTexto(erroMsg)
            erroAnim();
        }
    } catch (error) {
        setTexto("Oops! Erro!!");
        setSubTexto(`Falha ao conectar com o servidor: ${error}`);
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