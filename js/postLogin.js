document.addEventListener('DOMContentLoaded', () => {
    const botoesConta = document.querySelectorAll('.botoesConta');
    const botaoAcessaConta = document.getElementById('botaoAcessaConta');
    const nomeUsuario = document.getElementById('nomeUsuario');
    
    const vercel = 'https://sistema-monitoramento-linhas-onibus.vercel.app';

    // Como essa função usa requisições do banco de dados, atráves do back-end, a resposta não é imediata
    // (por isso o async, ele diz que essa função precisa de tempo para dar uma resposta)
    async function inicializarPagina() {
        const tokenLogin = localStorage.getItem('tokenLogin');
        
        gerenciaBotoesConta(tokenLogin, null);

        if (tokenLogin) {
            // Caso o usuario possua um token de login, mandamos procurar esse tal usuario
            // ( o await diz que que essa requisição precisa de tempo para dar uma resposta)
            const perfil = await buscaPerfilUsuario(tokenLogin);
            
            if (perfil) {
                // Se temos um perfil, então podems mudar o botão de "Olá [...]"
                gerenciaBotoesConta(tokenLogin, perfil);
            } else {
                // Caso não, temos uma situação interessante: temos um token, mas não um usuario
                console.log("Ocorreu um erro ao obter o perfil do usuário. O token pode ser inválido.");
                //localStorage.removeItem('tokenLogin');
                //location.reload();
            }
        }
    }

    async function buscaPerfilUsuario(token) {
        const url = `${vercel}/get-usuario-perfil`;

        try {
            // Mandamos pra url acima nosso token, para ver se podemos "entrar" no banco de dados
            const resposta = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Access-Token': `Bearer ${token}`
                }
            });
            
            if (resposta.ok) {
                const perfil = await resposta.json();
                console.log("Perfil obtido com sucesso: ", perfil);
                return perfil;
            } else {
                console.error("Erro ao buscar perfil. Status:", resposta.status, await resposta.json());
                return null;
            }
        } catch (error) {
            console.error("Erro de rede ao buscar perfil: ", error);
            return null;
        }
    }

    function gerenciaBotoesConta(tokenLogin, perfilUsuarioLogado) {
        const estaLogado =!!tokenLogin; // =!! é uma forma diferente de converter algo para boolean (meio parecido com == ou ===)

        if (botaoAcessaConta.classList.contains('hidden') === estaLogado) {
            botoesConta.forEach(cadaUm => {
                cadaUm.classList.toggle('hidden');
                cadaUm.classList.toggle('flex');
            });
            botaoAcessaConta.classList.toggle('hidden');
        }

        if (perfilUsuarioLogado) {
            nomeUsuario.innerHTML = perfilUsuarioLogado.nome_usu;
        } else {
            nomeUsuario.innerHTML = "Visitante";
        } 
    }

    // Inicia todo o processo.
    inicializarPagina();
});