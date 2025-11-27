document.addEventListener('DOMContentLoaded', () => {
  const tabela = document.getElementById('tabelaFavoritos');

  // 🔹 Cria um pequeno estilo interno para o efeito fade-in
  const estilo = document.createElement('style');
  estilo.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-in {
      animation: fadeIn 0.6s ease forwards;
    }
  `;
  document.head.appendChild(estilo);

  // 🔹 Verifica se o usuário está logado
  const usuarioLogado = localStorage.getItem('tokenLogin');
  if (!usuarioLogado) {
    tabela.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-6 text-gray-500 fade-in">
          Faça login para ver suas linhas ⭐
        </td>
      </tr>
    `;
    return;
  }

  // 🔹 Recupera favoritos do localStorage
  const favoritos = JSON.parse(localStorage.getItem('linhasFavoritas')) || [];

  if (favoritos.length === 0) {
    tabela.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-8 text-gray-600 text-lg fade-in">
          Você ainda não favoritou nenhuma linha 😢
        </td>
      </tr>
    `;
    return;
  }

  // 🔹 Exibe cada linha favorita com leve transição
  favoritos.forEach((f, i) => {
    const tr = document.createElement('tr');
    tr.classList.add('border-b', 'hover:bg-gray-50', 'fade-in');
    tr.style.animationDelay = `${i * 0.05}s`; // atraso progressivo
    tr.innerHTML = `
      <td class="text-center py-3 px-6 font-bold">${f.codigo}</td>
      <td class="text-center py-3 px-6">${f.nome}</td>
      <td class="text-center py-3 px-6">${f.previsao || '--:--'}</td>
      <td class="text-center py-3 px-6">${f.status || 'Desconhecido'}</td>
    `;
    tabela.appendChild(tr);
  });
});