import { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim } from './loadingAnim.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Pra ter certeza que vai acontecer quando tudo carregou
document.addEventListener('DOMContentLoaded', () => {
    
    // o "?" diz pra pegar o elemento caso ele exista.
    // Caso não, sem problemas: não da erro e nem faz nada
    const botaoCadastrar = document?.getElementById('botaoCadastrar');
    const botaoLogar = document?.getElementById('botaoLogar');
    const instituicaoField = document?.getElementById('instituicao');
    const semInstituicaoBotao = document?.getElementById('semInstituicao');
    const esqueciSenha = document?.getElementById('esqueciSenha');

    const supabaseUrl = "https://daorlyjkgqrqriqmbwcv.supabase.co";
    const supabasePublicKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhb3JseWprZ3FycXJpcW1id2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTc2MTUsImV4cCI6MjA3NjE3MzYxNX0.0FuejcYw5Rxm94SszM0Ohhg2uP5x1cvYonVwYHG7YL0";
    const supabase = createClient(supabaseUrl, supabasePublicKey);
    
    esqueciSenha?.addEventListener('click', async (e) => {
        e.preventDefault(); 
        
        const email = prompt('Digite seu e-mail cadastrado:');
        if (!email) return;

        iniciaAnim();
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

    // Configurando para os botões funcionarem
    botaoCadastrar?.addEventListener('click', (e) => {
        // Evita que o formulario seja enviado da forma que foi criado
        e.preventDefault();

        // Chama a validação
        validarCadastro();
    })
    
    botaoLogar?.addEventListener('click', (e) => {
        // Evita que o formulario seja enviado da forma que foi criado
        e.preventDefault();

        // Chama a validação
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
        // Verifica se a checkbox existe antes de pegar o checked
        const checkbox = document.getElementById("lembreMe");
        const lembrar = checkbox ? checkbox.checked : false;
    
        setTexto("Verificando...");
        
        // Junta os dois em uma variavel
        const dados = {email, senha};

        // Envia os dois dados + a informação de qual tipo de validação estamos usando
        if (validarCampos(dados, 'login')) {

            // Se o codigo retornar verdadeiro (true, ou seja, os campos são válidos), redireciona (já está dentro da função)
            enviarUsuarioParaServidor(dados, 'login', lembrar);
        };        
    }

    function validarCadastro() {
        iniciaAnim();

        // Pega os valores (value, checked) dos elementos
        const nome = document.getElementById("text").value.trim();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("password").value.trim();

        // Junta em uma objeto
        const dados = {nome, email, senha};

        // Envia os dados + a informação de qual tipo de validação estamos usando
        // Como não temos "lembrarMe" no cadastro, enviamos um "false" no lugar dele por precaução
        if (validarCampos(dados, 'cadastro', false)) {

            // Se o codigo retornar verdadeiro (true, ou seja, os campos são válidos), redireciona (já está dentro da função)
            enviarUsuarioParaServidor(dados, 'cadastro');
        }
    }

    async function enviarUsuarioParaServidor(dados, tipo, lembrar) {
        setTexto("Enviando dados...");
        // Aqui, usamos ${tipo} como variavel dinamica:
        // Se o codigo for do cadastro, a variavel "tipo" vai ser "cadastro", e aí o vercel chama a rota "cadastro-usuario".
        // Se o codigo for do login, a variavel "tipo" vai ser "login", e aí o vercel chama a rota "login-usuario".
        const url = `https://sistema-monitoramento-linhas-onibus.vercel.app/${tipo}-usuario`;

        try {
            // Manda pra url ali de cima o post com os dados inseridos no formulario
            const resposta = await fetch(url, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados), 
            });

            setTexto("Processando...");

            // Transforma a resposta em um json
            const dadosResposta = await resposta.json();

            // Se tudo estiver ok e for do tipo cadastro...
            if (resposta.ok && tipo === 'cadastro') { // Se tudo estiver ok e for do tipo cadastro...
                console.log(dadosResposta.message);
                setTexto("Sucesso!");
                setSubTexto("Redirecionando para login...");
                setTimeout(() => window.location.href = "login.html", 2500); // ... então redireciona pra pagina de login
            
            // Se tudo estiver ok e for do tipo login...
            } else if (resposta.ok && tipo === 'login') { // ('ok' significa status 200-299 (sucesso)) 
                const tokenLogin = dadosResposta.tokenLogin;
                
                if (lembrar) {
                    // Caso o "lembre de mim" esteja ativo, salva o token no navegador...
                    localStorage.setItem('tokenLogin', tokenLogin);
                    sessionStorage.removeItem('tokenLogin'); 
                } else {
                    // ... mas caso contrário, salva na sessão temporária (fechou o navegador, apagou o token)
                    sessionStorage.setItem('tokenLogin', tokenLogin);
                    localStorage.removeItem('tokenLogin'); 
                };

                console.log(dadosResposta.message);
                setTexto("Bem-vindo!");
                setTimeout(() => window.location.href = "index.html", 2500); // ... então redireciona pra pagina inicial
            
            // ... E se for qualquer outra coisa, dá erro
            } else {
                const erroMsg = dadosResposta.error;
                setTexto("Oops! Erro!!");
                setSubTexto(`Ocorreu um erro.\nInforme este erro à nossa equipe: ${erroMsg}`);
                erroAnim();
            }

        } catch (error) {
            setTexto("Erro de Conexão");
            setSubTexto(`Falha ao conectar.\nInforme este erro à nossa equipe: ${error}`);
            erroAnim();
        }
    };

    function validarCampos(dados, tipo) {
        // Como iniciaAnim já foi chamado antes, aqui só atualizamos o texto se der erro
        if (!dados.email || !dados.senha) {
            setTexto("Campos vazios!");
            setSubTexto("Por favor, preencha todos os campos.");
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

        const senhaRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
        if (!senhaRegex.test(dados.senha)) {
            setTexto("Senha fraca!");
            setSubTexto("Mínimo 6 caracteres, com letras, números ou caracteres especiais.");
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