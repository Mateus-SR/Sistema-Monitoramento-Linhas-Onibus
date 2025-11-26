import { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim } from './_site/js/loadingAnim.js';
// Importação direta do Supabase (Garante que sempre funciona)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// SUAS CHAVES
const supabaseUrl = "https://daorlyjkgqrqriqmbwcv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhb3JseWprZ3FycXJpcW1id2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTc2MTUsImV4cCI6MjA3NjE3MzYxNX0.0FuejcYw5Rxm94SszM0Ohhg2uP5x1cvYonVwYHG7YL0";

// Cria o cliente uma única vez aqui no topo
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    
    const botaoCadastrar = document?.getElementById('botaoCadastrar');
    const botaoLogar = document?.getElementById('botaoLogar');
    const instituicaoField = document?.getElementById('instituicao');
    const semInstituicaoBotao = document?.getElementById('semInstituicao');
    const esqueciSenha = document?.getElementById('esqueciSenha');

    // --- 1. LÓGICA DO ESQUECI A SENHA (CORRIGIDA) ---
    esqueciSenha?.addEventListener('click', async (e) => {
        e.preventDefault(); 
        
        const email = prompt('Digite seu e-mail cadastrado:');
        if (!email) return;

        iniciaAnim();
        setTexto("Enviando email...");
        setSubTexto("Aguarde um momento...");

        // Monta a URL para o arquivo de reset
        const siteUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        
        // CONFIRA SE O NOME DO ARQUIVO É ESSE MESMO NA SUA PASTA
        const urlFinal = siteUrl + 'reset-senha.html'; 

        console.log("Enviando reset para:", urlFinal);

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: urlFinal
        });

        if (error) {
            console.error("Erro Supabase:", error);
            setTexto("Oops! Erro ao enviar.");
            
            if(error.message.includes("Rate limit")) {
                setSubTexto("Muitas tentativas. Espere 1 min.");
            } else {
                setSubTexto(error.message); 
            }
            erroAnim();
        } else {
            setTexto("Email enviado!");
            setSubTexto("Verifique sua caixa de entrada.");
            setTimeout(() => {
                fechaAnim();
            }, 4000);
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

    // --- FUNÇÃO DE LOGIN OTIMIZADA ---
    async function validarLogin() {
        iniciaAnim();
        setTexto("Validando...");
    
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("password").value.trim();
        const checkbox = document.getElementById("lembreMe");
        const lembrar = checkbox ? checkbox.checked : false;
    
        if (!email || !senha) {
            setTexto("Campos vazios!");
            setSubTexto("Preencha e-mail e senha.");
            erroAnim();
            return;
        }
    
        setTexto("Entrando...");
        
        // Usamos a variável 'supabase' que criamos lá no topo
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: senha
        });
    
        if (error) {
            console.error("Erro login Supabase:", error);
            setTexto("Acesso Negado");
            if (error.message.includes("Invalid login")) {
                setSubTexto("E-mail ou senha incorretos.");
            } else {
                setSubTexto("Erro: " + error.message);
            }
            erroAnim();
        } else {
            console.log("Login sucesso:", data);
            
            const meta = data.user.user_metadata || {};
            const nomeParaSalvar = meta.full_name || meta.nome || data.user.email.split('@')[0];
    
            localStorage.setItem('nomeUsuario', nomeParaSalvar);
            
            if (lembrar) {
                localStorage.setItem('userEmailLembrete', email);
                localStorage.setItem('tokenLogin', data.session.access_token);
                sessionStorage.removeItem('tokenLogin'); 
            } else {
                localStorage.removeItem('userEmailLembrete');
                sessionStorage.setItem('tokenLogin', data.session.access_token);
                localStorage.removeItem('tokenLogin'); 
            }
           
            setTexto("Bem-vindo!");
            setSubTexto("Redirecionando...");
            
            setTimeout(() => {
                window.location.href = "index.html"; 
            }, 1000);
        }
    }

    // --- FUNÇÃO DE CADASTRO OTIMIZADA ---
    async function validarCadastro() {
        iniciaAnim();
        setTexto("Criando conta...");

        const nomeInput = document.getElementById("text"); 
        const emailInput = document.getElementById("email");
        const senhaInput = document.getElementById("password");

        const nome = nomeInput ? nomeInput.value.trim() : "";
        const email = emailInput ? emailInput.value.trim() : "";
        const senha = senhaInput ? senhaInput.value.trim() : "";

        if (!email || !senha) {
            setTexto("Campos vazios!");
            setSubTexto("Preencha todos os dados.");
            erroAnim();
            return;
        }

        if (senha.length < 6) {
            setTexto("Senha fraca!");
            setSubTexto("Mínimo de 6 caracteres.");
            erroAnim();
            return;
        }

        // Criação da Conta usando a variável global 'supabase'
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: senha,
            options: {
                data: { full_name: nome }
            }
        });

        if (error) {
            console.error("Erro no cadastro:", error);
            setTexto("Erro ao criar");
            setSubTexto(error.message);
            erroAnim();
        } else {
            console.log("Cadastro sucesso:", data);
            setTexto("Conta Criada!");
            setSubTexto("Faça login para continuar.");
            
            setTimeout(() => {
                window.location.href = "login.html"; 
            }, 1500);
        }
    }
    
    // Mantivemos essa função caso você use para salvar dados extras no seu JSON server antigo
    async function enviarUsuarioParaServidor(dados, tipo) {
        // ... sua lógica antiga se necessária ...
    };

    function validarCampos(dados, tipo) {
        // ... sua lógica antiga de validação visual ...
        return true; 
    }
});