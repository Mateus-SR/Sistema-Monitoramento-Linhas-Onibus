document.addEventListener('DOMContentLoaded', () => {
    const botoesConta = document?.querySelectorAll('.botoesConta');
    const botaoAcessaConta = document?.getElementById('botaoAcessaConta')
    const nomeUsuario = document?.getElementById('nomeUsuario');
    const tokenLogin = localStorage.getItem('tokenLogin');
    let perfilUsuarioLogado = null;
    
    const vercel = 'https://sistema-monitoramento-linhas-onibus.vercel.app';

    guardaPerfilUsuario();
    async function guardaPerfilUsuario() {
        const perfil = await buscaPerfilUsuario();
        
        if (perfil) {
            perfilUsuarioLogado = perfil;
        } else {
            console.log("Ocorreu um erro ao obter perfil do usuário");
        }

        gerenciaBotoesConta(tokenLogin, perfilUsuarioLogado);
    }

    async function buscaPerfilUsuario() {
        if (!tokenLogin) {
            console.log("Erro: usuário não logado.")
            return null;
        }

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
                console.log("Perfil: ", perfil);
                return perfil;

            } else {
                console.error("Houve algum erro ao buscar perfil: ", await resposta.json());
                return null;
            }

        } catch (error) {
            console.error("Erro: ", error);
            return null;
        }
    }

    

    function gerenciaBotoesConta(tokenLogin, perfilUsuarioLogado) {
        if (tokenLogin) {
            botoesConta.forEach(cadaUm => {
                cadaUm.classList.toggle('invisible');
            });
            botaoAcessaConta.classList.toggle('invisible');
        }

        if (perfilUsuarioLogado) {
            nomeUsuario.innerHTML = perfilUsuarioLogado.nome_usu;
        } else {
            nomeUsuario.innerHTML = "Usuário Desconhecido";
        }
    }
});