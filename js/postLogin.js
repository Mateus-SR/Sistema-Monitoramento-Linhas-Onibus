document.addEventListener('DOMContentLoaded', () => {
    const botoesConta = document?.querySelectorAll('.botoesConta');
    const botaoAcessaConta = document?.getElementById('botaoAcessaConta')
    const nomeUsuario = document?.getElementById('nomeUsuario');
    const tokenLogin = localStorage.getItem('tokenLogin');
    let perfilUsuarioLogado = null;
    
    guardaPerfilUsuario();
    async function guardaPerfilUsuario() {
        const perfil = await buscaPerfilUsuario();
        
        if (perfil) {
            perfilUsuarioLogado = perfil;
        } else {
            console.log("Ocorreu um erro ao obter perfil do usuário");
        }
    }

    async function buscaPerfilUsuario() {
        if (!tokenLogin) {
            console.log("Erro: usuário não logado.")
            return;
        }

        const url = 'https://sistema-monitoramento-linhas-onibus.vercel.app/get-usuario-perfil';

        try {
            const resposta = await fetch(url, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${tokenLogin}`
                }
              });
            
            if (resposta.ok) {
                const perfil = await resposta.json();
                console.log("Perfil: ", perfil);
                return perfil;

            } else {
                console.error("Ouve algum erro ao buscar perfil: ", await resposta.json());
                return null;
            }

        } catch (error) {
            console.error("Erro: ", error);
            return null;
        }
    }

    gerenciaBotoesConta(tokenLogin);

    function gerenciaBotoesConta(tokenLogin) {
        if (tokenLogin) {

            botoesConta.forEach(cadaUm => {
                cadaUm.classList.toggle('invisible');
            });
            botaoAcessaConta.classList.toggle('invisible');
            nomeUsuario.innerHTML = perfilUsuarioLogado.nome_usu;
        }
    }
});