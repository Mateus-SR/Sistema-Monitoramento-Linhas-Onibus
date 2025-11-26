import { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim, setSimNao } from './_site/js/loadingAnim.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// --- CONFIGURAÇÃO SUPABASE ---
const supabaseUrl = "https://daorlyjkgqrqriqmbwcv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhb3JseWprZ3FycXJpcW1id2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTc2MTUsImV4cCI6MjA3NjE3MzYxNX0.0FuejcYw5Rxm94SszM0Ohhg2uP5x1cvYonVwYHG7YL0";
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    const ConfiguraçãoForm = document.getElementById('ConfiguraçãoForm');
    const botaoAdicionar = document.getElementById('botaoAdicionar');
    const botaoRemover = document.getElementById('botaoRemover');
    const botaoSalvar = document.getElementById('botaoSalvar');
    const codParadaOG = document.getElementById('codParada_1');
    const tokenApiInput = document.getElementById('tokenApi'); // Campo do token

    const vercel = `https://sistema-monitoramento-linhas-onibus.vercel.app`;
    
    let counterFieldAdiciona = 1;
    
    // 1. Inicialização
    verificaEstado();
    carregarDadosUsuario(); // Carrega o token se existir

    // --- FUNÇÃO PARA CARREGAR O TOKEN SALVO ---
    async function carregarDadosUsuario() {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.user_metadata && user.user_metadata.sptrans_token) {
            if(tokenApiInput) {
                tokenApiInput.value = user.user_metadata.sptrans_token;
                console.log("Token carregado do perfil.");
            }
        }
    }

    // --- EVENT LISTENERS DOS BOTÕES ---

    botaoAdicionar.addEventListener('click', () =>{
        if (counterFieldAdiciona <= 4) {
            const novocodParada = codParadaOG.cloneNode(true);
            
            counterFieldAdiciona++;
            novocodParada.id = 'codParada_' + counterFieldAdiciona;
            
            novocodParada.value = '';

            if (novocodParada.classList.contains('bg-sptrans/25')) {
                novocodParada.classList.remove('bg-sptrans/25')
            };

            // Insere antes do container de botões, mas dentro do form ou div especifica
            // Como seu HTML tem o field dentro do form, vamos adicionar no lugar certo
            const containerParadas = document.getElementById('paradaField');
            if(containerParadas) {
                containerParadas.appendChild(novocodParada);
            } else {
                ConfiguraçãoForm.appendChild(novocodParada);
            }

            verificaEstado();
        }
    });

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

    // --- VALIDAÇÕES VISUAIS ---

    const campoCodErro = (input) => { input.classList.add('bg-sptrans/25'); }
    const campoCodCorreto = (input) => { input.classList.remove('bg-sptrans/25'); }

    ConfiguraçãoForm.addEventListener('input', (e) => {
        if (e.target.classList.contains('campoCodParada')) {
            const input = e.target;
            input.value = input.value.replace(/\D/g, ''); // Só numeros
            
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
            botaoAdicionar.classList.remove('text-black', 'hover:text-sptrans', 'cursor-pointer');
            botaoAdicionar.classList.add('text-gray-400', 'cursor-not-allowed');
        } else if (counterFieldAdiciona == 1) {
            botaoRemover.classList.remove('text-black', 'hover:text-sptrans', 'cursor-pointer');
            botaoRemover.classList.add('text-gray-400', 'cursor-not-allowed');
        } else {
            botaoAdicionar.classList.add('text-black', 'hover:text-sptrans', 'cursor-pointer');
            botaoAdicionar.classList.remove('text-gray-400', 'cursor-not-allowed');

            botaoRemover.classList.add('text-black', 'hover:text-sptrans', 'cursor-pointer');
            botaoRemover.classList.remove('text-gray-400', 'cursor-not-allowed');
        }
    };

    // --- FUNÇÃO PRINCIPAL DE SALVAR ---

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

        // 1. Salvar Token no Supabase (Se houver)
        const tokenValor = tokenApiInput ? tokenApiInput.value.trim() : "";
        
        // Atualiza o usuário com o token novo (ou vazio)
        const { error: errorToken } = await supabase.auth.updateUser({
            data: { sptrans_token: tokenValor }
        });

        if (errorToken) {
            console.error("Erro ao salvar token:", errorToken);
            // Não paramos o código aqui, pois o usuário pode querer salvar a exibição mesmo com erro no token
        }

        // 2. Validação dos Pontos
        setTexto("Validando códigos...");
        const nome = document?.getElementById('nomeExib').value;
        const todosCodigos = document.querySelectorAll('.campoCodParada');

        // Captura os valores novos
        const tempoAtraso = document.getElementById('tempoAtraso')?.value || 1;
        const tempoAdiantado = document.getElementById('tempoAdiantado')?.value || 1;
        const qtdOnibus = document.getElementById('qtdOnibus')?.value || 1;

        const promessasDeValidacao = Array.from(todosCodigos).map(cadaCampo => {
            const codigoDoPonto = cadaCampo.value;
            if(!codigoDoPonto) return Promise.resolve(true); // Ignora vazios

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
                console.error("Erro fetch:", err);
                campoCodErro(cadaCampo);
                return false;
            });
        });

        const resultados = await Promise.all(promessasDeValidacao);
        const formularioValido = resultados.every(r => r === true);

        if (!formularioValido) {
            erroAnim();
            setTexto("Oops! Erro!!");
            setSubTexto("Alguns códigos de parada são inválidos.");
            return;
        }

        const arrayCodigos = Array.from(todosCodigos).map(c => c.value).filter(v => v !== "");

        if (arrayCodigos.length === 0) {
            erroAnim();
            setTexto("Vazio!");
            setSubTexto("Adicione pelo menos um ponto de ônibus.");
            return;
        }

        try {
            // Monta o objeto com TUDO
            const dados = { 
                nome_exibicao: nome,
                codigos_parada: arrayCodigos,
                config: {
                    tempo_atraso: parseInt(tempoAtraso),
                    tempo_adiantado: parseInt(tempoAdiantado),
                    quantidade_onibus: parseInt(qtdOnibus)
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

            setTexto("Criando exibição...");
            const dadosResposta = await resposta.json();

            if (resposta.ok) { 
                setTexto("Sucesso!");
                setSubTexto("Configuração e Exibição salvas!");

                const codigoCriado = dadosResposta.codigo_exib;
                const confirma = await setSimNao("Acessar", "Configurar Mais");
                
                if (confirma) {
                    window.location.href = `exibicao.html?codigo=${codigoCriado}`;
                } else {
                    // Limpa campos ou mantem na tela
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

    // --- LÓGICA DOS CAMPOS NÚMERICOS (SETAS E LIMITES) ---
    const LIMITES = {
        tempoAtraso: { min: 1, max: 5 },
        tempoAdiantado: { min: 1, max: 5 },
        qtdOnibus: { min: 1, max: 8 }
    };

    document.querySelectorAll("input[type='number']").forEach(campo => {
        // Bloqueia teclas inválidas
        campo.addEventListener("keydown", (e) => {
            const permitido = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
            if (permitido.includes(e.key)) return;
            if (["e", "E", "+", "-", ".", ","].includes(e.key)) { e.preventDefault(); return; }
            if (!/^[0-9]$/.test(e.key)) { e.preventDefault(); }
        });

        // Bloqueia colar texto
        campo.addEventListener("paste", (e) => {
            const texto = e.clipboardData.getData("text");
            if (!/^\d+$/.test(texto)) { e.preventDefault(); }
        });

        // Corrige valor ao digitar
        campo.addEventListener("input", () => {
            const limite = LIMITES[campo.id];
            if (!limite) return;
            let val = campo.value.replace(/\D/g, "");
            let n = parseInt(val);
            if (isNaN(n)) n = limite.min;
            if (n > limite.max) n = limite.max;
            // if (n < limite.min) n = limite.min; // Removido para permitir apagar e digitar novo
            campo.value = n;
        });
        
        // Garante mínimo no focusout
        campo.addEventListener("focusout", () => {
             const limite = LIMITES[campo.id];
             if (!limite) return;
             let n = parseInt(campo.value);
             if (isNaN(n) || n < limite.min) campo.value = limite.min;
        });
    });

    // Botões Seta Cima
    document.querySelectorAll(".setaUp").forEach(btn => {
        btn.addEventListener("click", () => {
            const campo = document.getElementById(btn.dataset.target);
            if (!campo) return;
            const { min, max } = LIMITES[campo.id];
            const v = parseInt(campo.value) || min;
            campo.value = Math.min(v + 1, max);
        });
    });

    // Botões Seta Baixo
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