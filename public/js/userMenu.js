document.addEventListener('DOMContentLoaded', () => {

    // --- SELETORES DO DOM ---
    const botaoAntesLogin = document.getElementById('botaoAntesLogin');
    const botaoDepoisLogin = document.getElementById('botaoDepoisLogin');
    const nomeUsuarioSpan = document.getElementById('nomeUsuario');
    
    const userButton = document.getElementById('userButton');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const vercel = 'https://sistema-monitoramento-linhas-onibus.vercel.app';
    
    // --- INICIALIZAÇÃO ---
    inicializarPagina();
    inicializaDropdown();
    
    async function inicializarPagina() {
        // Tenta pegar token e nome salvos
        const tokenLogin = localStorage.getItem('tokenLogin') || sessionStorage.getItem('tokenLogin');
        const nomeSalvo = localStorage.getItem('nomeUsuario') || sessionStorage.getItem('nomeUsuario');

        // 1. SE TIVER TOKEN, MOSTRA O "OLÁ" IMEDIATAMENTE (Sem esperar API)
        if (tokenLogin) {
            console.log("Token encontrado. Mostrando menu de usuário...");
            
            // Força a exibição do menu logado usando o nome que salvamos no login
            gerenciaBotoesConta(true, { nome: nomeSalvo || 'Visitante' });

            // 2. Agora sim, valida com o servidor em segundo plano
            try {
                const perfil = await buscaPerfilUsuario(tokenLogin);
                
                if (perfil) {
                    // Se o servidor respondeu, atualiza o nome com o oficial
                    console.log("Perfil validado pelo servidor.");
                    const nomeOficial = perfil.nome_usu || perfil.nome || perfil.name || perfil.full_name;
                    gerenciaBotoesConta(true, { nome: nomeOficial });
                    
                    // Atualiza o cache local
                    if (nomeOficial) localStorage.setItem('nomeUsuario', nomeOficial);
                } else {
                    // Se o servidor retornou NULL (token inválido), aí sim deslogamos
                    // Mas apenas se for certeza que o token é ruim, não erro de rede
                    console.warn("Token de usuário nulo ou inválido.");
                    localStorage.removeItem('nomeUsuario');
                }
            } catch (err) {
                console.log("Erro de conexão com API (mas mantendo logado localmente):", err);
            }
        } else {
            // Se não tem token nenhum, mostra botão Entrar
            gerenciaBotoesConta(false, null);
        }
    }
  
    async function buscaPerfilUsuario(token) {
        const url = `${vercel}/get-usuario-perfil`;
        try {
            const resposta = await fetch(url, {
                method: 'GET',
                headers: { 'X-Access-Token': `Bearer ${token}` }
            });
            if (resposta.ok) return await resposta.json();
            return null;
        } catch (error) {
            // Se der erro de rede, retornamos null mas o código acima ignora erros de rede
            return null;
        }
    }
  
    function gerenciaBotoesConta(estaLogado, perfilUsuario) {
        // Lógica visual: Troca os botões
        if (estaLogado) {
            if (botaoDepoisLogin) botaoDepoisLogin.classList.remove('hidden');
            if (botaoAntesLogin) botaoAntesLogin.classList.add('hidden');
            
            // Atualiza o texto do nome
            if (nomeUsuarioSpan && perfilUsuario) {
                // Pega qualquer variação de nome que vier
                const nomeTexto = perfilUsuario.nome || perfilUsuario.nome_usu || perfilUsuario.name || perfilUsuario.full_name || "Visitante";
                nomeUsuarioSpan.innerText = nomeTexto;
            }
        } else {
            if (botaoDepoisLogin) botaoDepoisLogin.classList.add('hidden');
            if (botaoAntesLogin) botaoAntesLogin.classList.remove('hidden');
        }
    }
      
    function inicializaDropdown(){
        // Toggle do menu
        if (userButton && userDropdown) {
            userButton.addEventListener('click', (e) => {
                e.stopPropagation(); 
                userDropdown.classList.toggle('hidden');
            });
        }
    
        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (userDropdown && !userDropdown.classList.contains('hidden')) {
                if (!userButton.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.add('hidden');
                }
            }
        });
    
        // Botão Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    }

    function logout() {
        localStorage.removeItem('tokenLogin');
        localStorage.removeItem('nomeUsuario');
        sessionStorage.removeItem('tokenLogin');
        sessionStorage.removeItem('nomeUsuario');
        window.location.href = 'login.html';
    }
});