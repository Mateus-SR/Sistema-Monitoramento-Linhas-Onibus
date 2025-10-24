document.addEventListener('DOMContentLoaded', () => {
    const botoesConta = document.querySelectorAll('.botoesConta');
    const botaoAcessaConta = document.getElementById('botaoAcessaConta');
    const nomeUsuario = document.getElementById('nomeUsuario');
    
    const vercel = 'https://sistema-monitoramento-linhas-onibus.vercel.app';

    async function inicializarPagina() {
        const tokenLogin = localStorage.getItem('tokenLogin');
        
        gerenciaBotoesConta(tokenLogin, null);

        if (tokenLogin) {
            const perfil = await buscaPerfilUsuario(tokenLogin);
            
            if (perfil) {
                gerenciaBotoesConta(tokenLogin, perfil);
            } else {
                console.log("Ocorreu um erro ao obter o perfil do usuário. O token pode ser inválido.");
                //localStorage.removeItem('tokenLogin');
                //location.reload();
            }
        }
    }

    async function buscaPerfilUsuario(token) {
        const url = `${vercel}/get-usuario-perfil`;

        try {
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

        if (botaoAcessaConta.classList.contains('invisible') === estaLogado) {
            botoesConta.forEach(cadaUm => {
                cadaUm.classList.toggle('invisible');
            });
            botaoAcessaConta.classList.toggle('invisible');
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