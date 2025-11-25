import { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim } from './loadingAnim.js';

// Configuração do Supabase (Usando a biblioteca global carregada no HTML ou importada)
const supabaseUrl = "https://daorlyjkgqrqriqmbwcv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhb3JseWprZ3FycXJpcW1id2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTc2MTUsImV4cCI6MjA3NjE3MzYxNX0.0FuejcYw5Rxm94SszM0Ohhg2uP5x1cvYonVwYHG7YL0";

// Tenta pegar do window (CDN) ou importa se necessário
const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

document.addEventListener('DOMContentLoaded', () => {
    
    const botaoCadastrar = document?.getElementById('botaoCadastrar');
    const botaoLogar = document?.getElementById('botaoLogar');
    const instituicaoField = document?.getElementById('instituicao');
    const semInstituicaoBotao = document?.getElementById('semInstituicao');
    const esqueciSenha = document?.getElementById('esqueciSenha');

    // --- LÓGICA DO ESQUECI A SENHA ---
    esqueciSenha?.addEventListener('click', async (e) => {
        e.preventDefault(); 
        
        const email = prompt('Digite seu e-mail cadastrado:');
        if (!email) return;

        // IMPORTANTE: Primeiro inicia a animação (cria os elementos na tela)
        iniciaAnim();
        // SÓ DEPOIS define o texto (agora os elementos existem)
        setTexto("Enviando email...");
        setSubTexto("Aguarde um momento...");

        // Pega a URL base atual (funciona no localhost e no github)
        const siteUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        const urlFinal = siteUrl + 'reset-senha.html';

        if (!supabase) {
            setTexto("Erro Interno");
            setSubTexto("Biblioteca Supabase não carregada.");
            erroAnim();
            return;
        }

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: urlFinal
        });

        if (error) {
            setTexto("Oops! Erro ao enviar.");
            setSubTexto(error.message); // Exibe o erro real do Supabase
            erroAnim();
        } else {
            setTexto("Email enviado!");
            setSubTexto("Verifique sua caixa de entrada.");
            setTimeout(() => {
                fechaAnim();
            }, 3000);
        }
    });

    // --- LÓGICA DOS BOTÕES ---
    botaoCadastrar?.addEventListener('click', (e) => {
        e.preventDefault();
        validarCadastro();
    })
    
    botaoLogar?.addEventListener('click', (e) => {
        e.preventDefault();
        validarLogin();
    })
    
    semInstituicaoBotao?.addEventListener('click', () => {
        if(instituicaoField) {
             instituicaoField.toggleAttribute('disabled');
             instituicaoField.value = 0;
        }
    });

    async function validarLogin() {
        iniciaAnim();
        setTexto("Validando...");

        // Pega os valores
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("password").value.trim();
        // [NOVO] Pega o estado do checkbox
        const lembrar = document.getElementById("lembreMe").checked;

        if (!email || !senha) {
            setTexto("Campos vazios!");
            setSubTexto("Preencha e-mail e senha.");
            erroAnim();
            return;
        }

        setTexto("Verificando...");
        
        // Garante que o supabase existe
        if (!window.supabase && !supabase) {
             setTexto("Erro!"); 
             setSubTexto("Erro interno: Supabase não carregou.");
             erroAnim();
             return;
        }
        
        // O cliente pode estar na janela (window) ou na variável local
        const sbClient = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : supabase;

        // Tenta fazer o login
        const { data, error } = await sbClient.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (error) {
            console.error("Erro login Supabase:", error);
            setTexto("Acesso Negado");
            if (error.message.includes("Invalid login")) {
                setSubTexto("E-mail ou senha incorretos.");
            } else {
                setSubTexto(error.message);
            }
            erroAnim();
        } else {
    
            console.log("Login feito com Supabase:", data);
            
            // --- [MUDANÇA AQUI: LÓGICA DO LEMBRE DE MIM] ---
            if (lembrar) {
                // Se marcou "Lembre de mim": Salva no LocalStorage (Permanente)
                localStorage.setItem('tokenLogin', data.session.access_token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                // Limpa o sessionStorage para evitar duplicidade
                sessionStorage.removeItem('tokenLogin');
                sessionStorage.removeItem('userData');
            } else {
                // Se NÃO marcou: Salva no SessionStorage (Temporário - some ao fechar navegador)
                sessionStorage.setItem('tokenLogin', data.session.access_token);
                sessionStorage.setItem('userData', JSON.stringify(data.user));

                // Garante que não ficou nada antigo no LocalStorage
                localStorage.removeItem('tokenLogin');
                localStorage.removeItem('userData');
            }
            // -----------------------------------------------

            setTexto("Bem-vindo!");
            setSubTexto("Entrando no sistema...");
            
            setTimeout(() => {
                window.location.href = "index.html"; 
            }, 1000);
        }
    }

    function validarCadastro() {
        iniciaAnim();
        setTexto("Validando...");

        const nome = document.getElementById("text").value.trim();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("password").value.trim();
        const dados = {nome, email, senha};

        if (validarCampos(dados, 'cadastro')) {
            enviarUsuarioParaServidor(dados, 'cadastro');
        }
    }

    async function enviarUsuarioParaServidor(dados, tipo) {
        setTexto("Enviando dados...");
        const url = `https://sistema-monitoramento-linhas-onibus.vercel.app/${tipo}-usuario`;

        try {
            const resposta = await fetch(url, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados), 
            });

            setTexto("Processando...");
            const dadosResposta = await resposta.json();

            if (resposta.ok && tipo === 'cadastro') {
                console.log(dadosResposta.message);
                setTexto("Sucesso!");
                setSubTexto("Redirecionando para login...");
                setTimeout(() => window.location.href = "login.html", 1500);
            
            } else if (resposta.ok && tipo === 'login') { 
                const tokenLogin = dadosResposta.tokenLogin;
                localStorage.setItem('tokenLogin', tokenLogin);
                
                console.log(dadosResposta.message);
                setTexto("Bem-vindo!");
                setTimeout(() => window.location.href = "index.html", 1000);
            
            } else {
                const erroMsg = dadosResposta.error;
                setTexto("Oops! Erro!!");
                setSubTexto(erroMsg);
                erroAnim();
            }

        } catch (error) {
            setTexto("Erro de Conexão");
            setSubTexto(`Falha ao conectar: ${error}`);
            erroAnim();
        }
    };

    function validarCampos(dados, tipo) {
        // Como iniciaAnim já foi chamado antes, aqui só atualizamos o texto se der erro
        if (!dados.email || !dados.senha) {
            setTexto("Campos vazios!");
            setSubTexto("Por favor, preencha tudo.");
            erroAnim();
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dados.email)) {
            setTexto("Email inválido!");
            setSubTexto("Verifique o endereço digitado.");
            erroAnim();
            return false;
        }

        const senhaRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if (!senhaRegex.test(dados.senha)) {
            setTexto("Senha fraca!");
            setSubTexto("Mínimo 6 caracteres, letras e números.");
            erroAnim();
            return false;
        }

        if (tipo === 'cadastro' && (!dados.nome || dados.nome.length < 3)) {
            setTexto("Nome inválido!");
            setSubTexto("Digite seu nome completo.");
            erroAnim();
            return false;
        }

        return true;
    }
});