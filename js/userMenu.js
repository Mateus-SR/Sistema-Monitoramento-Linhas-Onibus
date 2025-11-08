document.addEventListener('DOMContentLoaded', () => {
  const botoesConta = document.getElementById('botoesConta');
  const botaoAcessaConta = document.getElementById('botaoAcessaConta');
  const nomeUsuarioSpan = document.getElementById('nomeUsuario');
  const userButton = document.getElementById('userButton');
  const userDropdown = document.getElementById('userDropdown');
  const logoutBtn = document.getElementById('logoutBtn');

  // 🔹 Verifica se o usuário está logado
  const token = localStorage.getItem('tokenLogin');
  const nomeUsuario = localStorage.getItem('nomeUsuario');

  if (token) {
    // Usuário logado → mostra menu, esconde botões
    if (botoesConta) botoesConta.classList.add('hidden');
    if (botaoAcessaConta) botaoAcessaConta.classList.remove('hidden');
    if (nomeUsuarioSpan) nomeUsuarioSpan.textContent = nomeUsuario || 'Usuário';
  } else {
    // Usuário não logado → mostra botões, esconde menu
    if (botoesConta) botoesConta.classList.remove('hidden');
    if (botaoAcessaConta) botaoAcessaConta.classList.add('hidden');
  }

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
});


// 🔸 Função global para mostrar aviso bonito
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

  

