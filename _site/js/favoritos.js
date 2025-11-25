document.addEventListener('DOMContentLoaded', () => {
  const tabela = document.getElementById('tabelaFavoritos');

  // Verifica se o usuário está logado
  const usuarioLogado = localStorage.getItem('usuarioLogado'); 
  if (!usuarioLogado) {
    tabela.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-6 text-gray-500">
          Faça login para ver suas linhas favoritas
        </td>
      </tr>
    `;
    return;
  }

  // Recupera os favoritos do localStorage
  const favoritos = JSON.parse(localStorage.getItem('linhasFavoritas')) || [];

  if (favoritos.length === 0) {
    tabela.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-6 text-gray-500">
          Você ainda não favoritou nenhuma linha 😢
        </td>
      </tr>
    `;
    return;
  }

  // Exibe cada linha na tabela
  favoritos.forEach(f => {
    const tr = document.createElement('tr');
    tr.classList.add('border-b', 'hover:bg-gray-50');
    tr.innerHTML = `
      <td class="text-center py-3 px-6 font-bold">${f.codigo}</td>
      <td class="text-center py-3 px-6">${f.nome}</td>
      <td class="text-center py-3 px-6">${f.previsao || '--:--'}</td>
      <td class="text-center py-3 px-6">${f.status || 'Desconhecido'}</td>
    `;
    tabela.appendChild(tr);
  });
});
