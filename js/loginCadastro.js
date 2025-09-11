// Pra ter certeza que vai acontecer quando tudo carregou
document.addEventListener('DOMContentLoaded', () => {
    
    // o "?" diz pra pegar o elemento caso ele exista.
    // Caso não, sem problemas: não da erro e nem faz nada
    const botaoCadastrar = document?.getElementById('botaoCadastrar');
    const botaoLogar = document?.getElementById('botaoLogar');

    const instituicaoField = document?.getElementById('instituicao');
    const semInstituicaoBotao = document?.getElementById('semInstituicao');

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



function validarLogin() {
    // Pega os valores (value) dos elementos
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("password").value.trim();

    // Junta os dois em uma variavel
    const dados = {email, senha};

    // Envia os dois dados + a informação de qual tipo de validação estamos usando
    if (validarCampos(dados, 'login')) {

        // Se o codigo retornar verdadeiro (true), redireciona
        window.location.href = "exibicao.html";
    };
}

function validarCadastro() {
    // Pega os valores (value, checked) dos elementos
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("password").value.trim();
    const instituicao = document.getElementById("instituicao").value;
    const semInstituicao = document.getElementById("semInstituicao").checked;

    // Junta os quatro em uma variavel
    const dados ={email, senha, instituicao, semInstituicao};

    // Envia os quatro dados + a informação de qual tipo de validação estamos usando
    if (validarCampos(dados, 'cadastro')) {

        // Se o codigo retornar verdadeiro (true), redireciona
        window.location.href = "login.html";
    }
}

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