import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://daorlyjkgqrqriqmbwcv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhb3JseWprZ3FycXJpcW1id2N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTc2MTUsImV4cCI6MjA3NjE3MzYxNX0.0FuejcYw5Rxm94SszM0Ohhg2uP5x1cvYonVwYHG7YL0";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


import { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim } from './loadingAnim.js';

// Pra ter certeza que vai acontecer quando tudo carregou
document.addEventListener('DOMContentLoaded', () => {
    
    // o "?" diz pra pegar o elemento caso ele exista.
    // Caso não, sem problemas: não da erro e nem faz nada
    const botaoCadastrar = document?.getElementById('botaoCadastrar');
    const botaoLogar = document?.getElementById('botaoLogar');

    const instituicaoField = document?.getElementById('instituicao');
    const semInstituicaoBotao = document?.getElementById('semInstituicao');

    const esqueciSenha = document?.getElementById('esqueciSenha');
    // Configurando para os botôes funcionarem
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
        instituicaoField.toggleAttribute('disabled');
        instituicaoField.value = 0;
    });
    esqueciSenha?.addEventListener('click', async () => {
    const email = prompt('Digite seu e-mail cadastrado:')
    if (!email) return

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://SEUSITE.com/reset-senha.html' // coloque aqui a página de redefinição
    })

    if (error) {
        setTexto("Oops! Erro ao enviar email.")
        setSubTexto(error.message)
        erroAnim();
    } else {
        setTexto("Email enviado!")
        setSubTexto("Verifique seu e-mail para redefinir a senha.")
        // Você pode opcionalmente fechar a animação após alguns segundos
        setTimeout(() => {
            fechaAnim()
        }, 2000)
    }
});



    function validarLogin() {
        iniciaAnim();

        // Pega os valores (value) dos elementos
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("password").value.trim();

        // Junta os dois em uma variavel
        const dados = {email, senha};

        // Envia os dois dados + a informação de qual tipo de validação estamos usando
        if (validarCampos(dados, 'login')) {

            // Se o codigo retornar verdadeiro (true), redireciona
            enviarUsuarioParaServidor(dados, 'login');
        };
    }

    function validarCadastro() {
        iniciaAnim();

        // Pega os valores (value, checked) dos elementos
        const nome = document.getElementById("text").value.trim();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("password").value.trim();
        //const instituicao = document.getElementById("instituicao").value;
        //const semInstituicao = document.getElementById("semInstituicao").checked;

        // Junta os quatro em uma variavel
        const dados = {nome, email, senha, /*instituicao, semInstituicao*/};

        // Envia os quatro dados + a informação de qual tipo de validação estamos usando
        if (validarCampos(dados, 'cadastro')) {

            // Se o codigo retornar verdadeiro (true), redireciona
            enviarUsuarioParaServidor(dados, 'cadastro');
        }
    }

    async function enviarUsuarioParaServidor(dados, tipo) {
        setTexto("Enviando dados...");
        // Aqui, usamos ${tipo} como variavel dinamica:
        // Se o codigo for do cadastro, a variavel "tipo" vai ser "cadastro", e aí o vercel chama a rota "cadastro-usuario".
        // Se o codigo for do login, a variavel "tipo" vai ser "login", e aí o vercel chama a rota "login-usuario".
        const url = `https://sistema-monitoramento-linhas-onibus.vercel.app/${tipo}-usuario`;

        try {
            // Manda pra url ali de cima o post com os dados inseridos no formulario
            const resposta = await fetch(url, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados), 
            });

            setTexto("Recebendo dados...");

            // Transforma a resposta em um json
            const dadosResposta = await resposta.json();

            // Se tudo estiver ok e for do tipo cadastro...
            if (resposta.ok && tipo === 'cadastro') { // ('ok' significa status 200-299 (sucesso)) 

                console.log(dadosResposta.message);
                window.location.href = "login.html"; // ... então redireciona pra pagina de login
            
            // Se tudo estiver ok e for do tipo login...
            } else if (resposta.ok && tipo === 'login') { // ('ok' significa status 200-299 (sucesso)) 
                const tokenLogin = dadosResposta.tokenLogin;
                localStorage.setItem('tokenLogin', tokenLogin);
                
                console.log(dadosResposta.message);
                window.location.href = "index.html"; // ... então redireciona pra pagina de personalização/configuração/perfil
            
            // E se for qualquer outra coisa, dá erro
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
            //alert('Não foi possível se conectar ao servidor. Tente novamente mais tarde.');
        }
    };

    function validarCampos(dados, tipo) {
    setTexto("Validando campos");

    if (!dados.email || !dados.senha) {
        setTexto("Oops!");
        setSubTexto("Por favor, preencha todos os campos.");
        erroAnim();
        return false;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dados.email)) {
        setTexto("Oops!");
        setSubTexto("Por favor, insira um email válido.");
        erroAnim();
        return false;
    }

    // Validação de senha
    const senhaRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!senhaRegex.test(dados.senha)) {
        setTexto("Oops!");
        setSubTexto("Senha deve ter pelo menos 6 caracteres, incluindo letras e números, sem espaços.");
        erroAnim();
        return false;
    }

    // Validação de nome (apenas cadastro)
    if (tipo === 'cadastro' && (!dados.nome || dados.nome.length < 3)) {
        setTexto("Oops!");
        setSubTexto("Por favor, insira um nome válido.");
        erroAnim();
        return false;
    }

    return true;
}


    function validarInstituicao(semInstituicao, instituicao) {
        // Caso a caixa "sem instituição" não estiver marcada E ao mesmo tempo não selecionamos alguma... erro!
        if (!semInstituicao && instituicao === "0") {
            setTexto("Oops!");
            setSubTexto("Por favor, selecione uma instituição.");
            erroAnim();
            return false;
        }

        // Caso estejamos com a caixa "sem instituição" marcada, sucesso. Passamos no teste
        return true;
    }


    });