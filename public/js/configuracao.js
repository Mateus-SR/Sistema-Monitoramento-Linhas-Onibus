import { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim, setSimNao } from './loadingAnim.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

document.addEventListener('DOMContentLoaded', () => {
    const ConfiguraçãoForm = document.getElementById('ConfiguraçãoForm');
    const botaoAdicionar = document.getElementById('botaoAdicionar');
    const botaoRemover = document.getElementById('botaoRemover');
    const botaoSalvar = document.getElementById('botaoSalvarInput');
    const codParadaOG = document.getElementById('codParada_1');
    const dropdownBtn = document.getElementById("dropdownBtn");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const fac_id = document.getElementById("instituicaoId");
    const semInstituicaoCheckbox = document.getElementById("semInstituicao");

    const vercel = `https://sistema-monitoramento-linhas-onibus.vercel.app`;
    const supabaseUrl = "https://daorlyjkgqrqriqmbwcv.supabase.co";
    const supabasePublicKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhb3JseWprZ3FycXJpcW1id2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTc2MTUsImV4cCI6MjA3NjE3MzYxNX0.0FuejcYw5Rxm94SszM0Ohhg2uP5x1cvYonVwYHG7YL0";
    const supabase = createClient(supabaseUrl, supabasePublicKey);

    // Variável global de controle
    let counterFieldAdiciona = 1;
    
    // --- LÓGICA DE INICIALIZAÇÃO (CRIAR ou EDITAR) ---
    const urlParams = new URLSearchParams(window.location.search);
    const codigoEdicao = urlParams.get('editar'); // Verifica se tem ?editar=CODIGO na URL

    if (codigoEdicao) {
        modoEdicao(codigoEdicao); // Se tiver código, carrega modo edição
    } else {
        carregarDadosUsuario();   // Se for novo, tenta carregar token do usuário
        verificaEstado();         // Configura botões iniciais
    }
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
        if (codigoEdicao) {
            processarEdicao(codigoEdicao); // Atualiza
        } else {
            salvarExibicao(); // Cria novo
        }
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

    carregarInstituicoes();

    // 1. Controle do Checkbox "Não faço parte"
    if (semInstituicaoCheckbox) {
        semInstituicaoCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                // Se marcou: Limpa o ID, muda o texto e desabilita o botão visualmente
                fac_id.value = ""; 
                dropdownBtn.innerText = "Nenhuma instituição selecionada";
                dropdownBtn.classList.add("bg-gray-100", "text-gray-400", "cursor-not-allowed");
                dropdownBtn.disabled = true;
                dropdownMenu.classList.add("hidden");
            } else {
                // Se desmarcou: Reabilita o botão
                dropdownBtn.innerText = "Selecione uma instituição";
                dropdownBtn.classList.remove("bg-gray-100", "text-gray-400", "cursor-not-allowed");
                dropdownBtn.disabled = false;
            }
        });
    }

    // 2. Controle de Abrir/Fechar Dropdown
    if (dropdownBtn) {
        dropdownBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (!dropdownBtn.disabled) {
                dropdownMenu.classList.toggle("hidden");
            }
        });

        // Fechar ao clicar fora
        document.addEventListener("click", (e) => {
            if (dropdownMenu && !dropdownMenu.classList.contains('hidden')) {
                if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.add("hidden");
                }
            }
        });
    }

    // 3. Função para Buscar do Supabase e Preencher
    async function carregarInstituicoes() {
        const { data, error } = await supabase
            .from("fatec")
            .select("id_fac, nome_fac")
            .order("nome_fac");
        
        if (error) {
            console.error("Erro ao carregar instituições:", error);
            return;
        }

        if (dropdownMenu) {
            // Gera o HTML das opções
            const html = data.map(inst =>
                `<div class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black" data-id="${inst.id_fac}">
                    ${inst.nome_fac}
                 </div>`
            ).join('');

            dropdownMenu.innerHTML = html;

            // Adiciona evento de clique em CADA opção
            dropdownMenu.querySelectorAll("div").forEach(item => {
                item.addEventListener("click", () => {
                    // Atualiza visual
                    dropdownBtn.textContent = item.innerText.trim();
                    
                    // Atualiza dado real (Hidden Input)
                    fac_id.value = item.dataset.id;
                    
                    // Garante que o checkbox seja desmarcado se o usuário escolher uma faculdade
                    if (semInstituicaoCheckbox) {
                        semInstituicaoCheckbox.checked = false;
                        semInstituicaoCheckbox.dispatchEvent(new Event('change')); // Força atualização visual se necessário
                    }

                    dropdownMenu.classList.add("hidden");
                });
            });
        }
    }


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
    const tokenLogin = localStorage.getItem('tokenLogin') || sessionStorage.getItem('tokenLogin');
    const tokenInput = document.getElementById('tokenApi');
    const tokenValor = tokenInput ? tokenInput.value.trim() : "";

    if (tokenValor) {
        const tokenValido = await processarTokenSPTrans(tokenValor, tokenLogin);
        if (!tokenValido) return; 
    }
    
    setTexto("Validando dados...");

    if (!tokenLogin) {
        erroAnim();
        setTexto("Oops! Erro!!");
        setSubTexto("Você não está logado. Por favor, faça login novamente.");
        return;
    }

    const nome = document?.getElementById('nomeExib').value;
    const todosCodigos = document.querySelectorAll('.campoCodParada');

    const config = obterConfiguracao();

    const formularioValido = await validarParadas(todosCodigos, tokenLogin);

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

    const dados = { 
        nome_exibicao: nome,
        codigos_parada: arrayCodigos,
        nome_exibicao: nome,
        fac_id: fac_id.value,
        config: config
    };

    await enviarExibicao(dados, tokenLogin);
};

// Funções auxiliares
async function processarTokenSPTrans(tokenValor, tokenLogin) {
    setTexto("Validando token SPTrans...");
    
    // A. Valida na API da SPTrans
    const validacao = await fetch(`${vercel}/validar-token-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ API_TOKEN: tokenValor })
    });

    if (!validacao.ok) {
        erroAnim();
        setTexto("Token Inválido!");
        setSubTexto("O token da SPTrans informado não autenticou.");
        return false; // Para o processo
    }

    // B. Salva no Banco de Dados (Tabela Usuário)
    const update = await fetch(`${vercel}/update-sptrans-token`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': `Bearer ${tokenLogin}`
        },
        body: JSON.stringify({ API_TOKEN: tokenValor })
    });

    if (!update.ok) {
        console.error("Erro ao salvar token no banco");
        // Opcional: Avisar usuário ou seguir mesmo assim
    }
    return true;
}

function obterConfiguracao() {
    // --- [MUDANÇA 1] Captura os valores dos novos inputs ---
    const tempoAtrasoInput = document.getElementById('tempoAtraso');
    const tempoAdiantadoInput = document.getElementById('tempoAdiantado');
    const distanciaMinInput = document.getElementById('distanciaMinOnibus');

    // Define valores padrão se os campos estiverem vazios ou inválidos
    const tempoAtraso = tempoAtrasoInput ? parseInt(tempoAtrasoInput.value) : 2;
    const tempoAdiantado = tempoAdiantadoInput ? parseInt(tempoAdiantadoInput.value) : 2;
    const distanciaMinima = distanciaMinInput ? parseInt(distanciaMinInput.value) : 20; // Padrão 20min
    // -----------------------------------------------------------

    return {
        tempo_atraso: tempoAtraso,
        tempo_adiantado: tempoAdiantado,
        distanciaMinOnibus: distanciaMinima
    };
}

async function validarParadas(todosCodigos, tokenLogin) {
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
    return resultados.every(resultado => resultado === true);
}

async function enviarExibicao(dados, tokenLogin) {
    try {
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
}

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

 async function modoEdicao(codigo) {
        iniciaAnim();
        setTexto("Carregando...");
        carregarDadosUsuario();
        
        try {
            // Busca os dados atuais da exibição
            const res = await fetch(`${vercel}/exibicao/${codigo}`);
            if (!res.ok) throw new Error("Erro ao buscar dados");
            const dados = await res.json();

            // 1. Muda visual da página
            const titulo = document.querySelector('h2');
            if(titulo) titulo.innerText = `Editando: ${dados.nome_exibicao || codigo}`;
            botaoSalvar.value = "Atualizar Exibição";

            // 2. Preenche configurações
            document.getElementById('nomeExib').value = dados.nome_exibicao || "";
            document.getElementById('tempoAtraso').value = dados.tempo_atraso || 2;
            document.getElementById('tempoAdiantado').value = dados.tempo_adiantado || 2;
            document.getElementById('distanciaMinOnibus').value = dados.quantidade_onibus || 20;

            // 3. Preenche Pontos de Parada
            if (dados.paradas && dados.paradas.length > 0) {
                // Preenche o 1º campo
                document.getElementById('codParada_1').value = dados.paradas[0].codigo_parada;

                // Cria campos extras se tiver mais pontos
                for (let i = 1; i < dados.paradas.length; i++) {
                    if (counterFieldAdiciona < 5) {
                        botaoAdicionar.click(); // Simula clique para criar campo
                        const inputNovo = document.getElementById(`codParada_${counterFieldAdiciona}`);
                        if(inputNovo) inputNovo.value = dados.paradas[i].codigo_parada;
                    }
                }
            }
            fechaAnim();
        } catch (e) {
            erroAnim(); setTexto("Erro"); setSubTexto(e.message);
        }
    }

    // --- FUNÇÃO PARA CARREGAR O TOKEN DO USUÁRIO ---
    async function carregarDadosUsuario() {
        const tokenLogin = localStorage.getItem('tokenLogin') || sessionStorage.getItem('tokenLogin');
        
        if (!tokenLogin) return;

        try {
            const res = await fetch(`${vercel}/get-usuario-perfil`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': `Bearer ${tokenLogin}`
                }
            });

            if (res.ok) {
                const usuario = await res.json();
                
                const tokenInput = document.getElementById('tokenApi');

                if (tokenInput && usuario.token_usu) {
                    tokenInput.value = usuario.token_usu;
                    console.log("Token SPTrans carregado do banco de dados.");
                }
            }
        } catch (error) {
            console.error("Erro ao carregar dados do usuário:", error);
        }
    }

    async function processarEdicao(codigo) {
        iniciaAnim();
        
        // Coleta dados manualmente (similar ao salvarExibicao)
        const nome = document.getElementById('nomeExib').value;
        const arrayCodigos = Array.from(document.querySelectorAll('.campoCodParada'))
                                  .map(i => i.value).filter(v => v !== "");
        
        const config = {
            tempo_atraso: parseInt(document.getElementById('tempoAtraso').value) || 2,
            tempo_adiantado: parseInt(document.getElementById('tempoAdiantado').value) || 2,
            distanciaMinOnibus: parseInt(document.getElementById('distanciaMinOnibus').value) || 20
        };

        if (arrayCodigos.length === 0) {
            erroAnim(); setTexto("Inválido"); return;
        }

        try {
            const resposta = await fetch(`${vercel}/editar-exibicao`, {
                method: 'PUT', // Método PUT para atualizar
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Token': `Bearer ${localStorage.getItem('tokenLogin')}`
                },
                body: JSON.stringify({ 
                    codigo_exib: codigo,
                    nome_exibicao: nome,
                    fac_id: fac_id.value,
                    codigos_parada: arrayCodigos,
                    config: config
                })
            });

            if (resposta.ok) {
                setTexto("Atualizado!");
                setTimeout(() => window.location.href = `exibicao.html?codigo=${codigo}`, 1500);
            } else {
                throw new Error("Falha ao atualizar");
            }
        } catch (error) {
            erroAnim(); setTexto("Erro");
        }
    }

});
