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
    esqueciSenha?.addEventListener('click', () => {
        alert('Oops! Essa é uma mensagem temporária.\nÉ uma pena que você tenha esquecido sua senha...\n\nMas não se preocupe!\nEnviaremos em seu email um link para que você possa alterar sua senha!')
    });


    function validarLogin() {
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
        // Pega os valores (value, checked) dos elementos
        const nome = document.getElementById("text").value.trim();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("password").value.trim();
        const instituicao = document.getElementById("instituicao").value;
        const semInstituicao = document.getElementById("semInstituicao").checked;

        // Junta os quatro em uma variavel
        const dados = {nome, email, senha, instituicao, semInstituicao};

        // Envia os quatro dados + a informação de qual tipo de validação estamos usando
        if (validarCampos(dados, 'cadastro')) {

            // Se o codigo retornar verdadeiro (true), redireciona
            enviarUsuarioParaServidor(dados, 'cadastro');
        }
    }

    async function enviarUsuarioParaServidor(dados, tipo) {
        const url = `https://sistema-monitoramento-linhas-onibus.vercel.app/${tipo}-usuario`;

        try {
            const resposta = await fetch(url, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados), 
            });

            const dadosResposta = await resposta.json();

            if (resposta.ok && tipo === 'cadastro') { // 'ok' significa status 200-299 (o nosso 201)    

                console.log(dadosResposta.message);
                window.location.href = "login.html"; // Redireciona SÓ SE der certo
            
            } else if (resposta.ok && tipo === 'login') { // 'ok' significa status 200-299 (o nosso 201)
                const tokenLogin = dadosResposta.tokenLogin;
                localStorage.setItem('tokenLogin', tokenLogin);
                
                console.log(dadosResposta.message);
                window.location.href = "personalizacao.html"; // Redireciona SÓ SE der certo
            
            } else { 
                console.log('Erro: ' + dadosResposta.error); 
            }

        } catch (error) {
            console.error('Falha ao conectar com o servidor:', error);
            //alert('Não foi possível se conectar ao servidor. Tente novamente mais tarde.');
        }
    };

    function validarCampos(dados, tipo) {

        // Se email "não for" ou senha "não for", manda alert e retorna false (nesse caso, "falha")
        // Caso email e senha sejam válidos, passa reto por esse if e vai pro próximo
        // (OBS: Login sempre passa por esse, mas nunca pelo próximo)
        if (!dados.email || !dados.senha) {
            alert("Por favor, preencha todos os campos!");
            return false;
        }

        // Se estamos lidando com um cadastro...
        if (tipo === 'cadastro') {
            // Verifica na função validarInstituicao marcamos que não somos de instituição ou se não selecionamos alguma
            // 
            if (!validarInstituicao(dados.semInstituicao, dados.instituicao)) {
                return false;
            }
        }

        // Caso tenhamos passado por todas as verificações
        return true;
    }

    function validarInstituicao(semInstituicao, instituicao) {
        // Caso a caixa "sem instituição" não estiver marcada E ao mesmo tempo não selecionamos alguma... erro!
        if (!semInstituicao && instituicao === "0") {
            alert("Por favor, selecione uma instituição.");
            return false;
        }

        // Caso estejamos com a caixa "sem instituição" marcada, sucesso. Passamos no teste
        return true;
    }


    });