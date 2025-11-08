document.addEventListener('DOMContentLoaded', () => {
  const botoesConta = document.querySelectorAll('botoesConta');
  const botaoAcessaConta = document.getElementById('botaoAcessaConta');
  const nomeUsuarioSpan = document.getElementById('nomeUsuario');
  const userButton = document.getElementById('userButton');
  const userDropdown = document.getElementById('userDropdown');
  const logoutBtn = document.getElementById('logoutBtn');

  const botaoAntesLogin = document.getElementById('botaoAntesLogin');
  const botaoDepoisLogin = document.getElementById('botaoDepoisLogin');



  const vercel = 'https://sistema-monitoramento-linhas-onibus.vercel.app';
  
  // Inicia todo o processo.
  inicializarPagina();
  

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
              localStorage.removeItem('tokenLogin');
              location.reload();
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
    // o tokenLogin nos confirma que o usuario está logado ou não, e o perfilUsuarioLogado é onde podemos pegar suas informações
      const estaLogado =!!tokenLogin; // =!! é uma forma diferente de converter algo para boolean (meio parecido com == ou ===)

      /* 
      if (perfilUsuarioLogado) {
        const nomeUsuario = perfilUsuarioLogado.nome_usu;
        localStorage.setItem('nomeUsuario', nomeUsuario);
      }
      */

      if (estaLogado) {
        botaoDepoisLogin.classList.remove('hidden');
        botaoAntesLogin.classList.add('hidden');
      } else {
        botaoDepoisLogin.classList.add('hidden');
        botaoAntesLogin.classList.remove('hidden');
      }

      if (perfilUsuarioLogado) {
        nomeUsuarioSpan.innerHTML = perfilUsuarioLogado.nome_usu;
      } else {
        nomeUsuarioSpan.innerHTML = "Visitante";
      } 

    }
    
    inicializaDropdown();
  function inicializaDropdown(){
    // 🔹 Alterna visibilidade do menu dropdown
    if (userButton && userDropdown) {
      userButton.addEventListener('click', (e) => {
        e.stopPropagation(); // impede o fechamento imediato
        userDropdown.classList.toggle('hidden');
      });
    }
  
    // 🔹 Fecha o dropdown ao clicar fora
    document.addEventListener('click', (e) => {
      if (userDropdown && !botaoAcessaConta.contains(e.target)) {
        userDropdown.classList.add('hidden');
      }
    });
  
    // 🔹 Logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('tokenLogin');
        localStorage.removeItem('nomeUsuario');
        window.location.href = 'login.html';
      });
    }
  
    // 🔹 Protege links do menu contra acesso sem login
    const linksProtegidos = document.querySelectorAll('#userDropdown a');
    linksProtegidos.forEach(link => {
      link.addEventListener('click', (e) => {
        const token = localStorage.getItem('tokenLogin');
        if (!token) {
          e.preventDefault(); // impede ir para a página
          mostrarAvisoLogin(); // chama o aviso estilizado
        }
      });
    });  
  }

  // Função global para mostrar aviso bonito
  function mostrarAvisoLogin() {
    // Remove aviso anterior (se existir)
    const avisoAntigo = document.getElementById('avisoLogin');
    if (avisoAntigo) avisoAntigo.remove();
    
    // Cria o fundo escuro + caixa
    const aviso = document.createElement('div');
    aviso.id = 'avisoLogin';
    aviso.innerHTML = `
    <div class="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-99999 animate-fadeIn">
    <div class="bg-white p-6 rounded-2xl shadow-2xl text-center w-80 border border-gray-200 relative z-100000">
    <h2 class="text-xl font-semibold text-red-600 mb-2"></h2>
    <p class="text-gray-700 mb-4">Você precisa fazer login para acessar esta área.</p>
    <div class="flex justify-center gap-3">
    <a href="login.html" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all">Fazer login</a>
    <button id="fecharAviso" class="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg transition-all">Fechar</button>
    </div>
    </div>
    </div>
    `;
    document.body.appendChild(aviso);
    
    // Fecha o aviso
  document.getElementById('fecharAviso').addEventListener('click', () => aviso.remove());
}




});