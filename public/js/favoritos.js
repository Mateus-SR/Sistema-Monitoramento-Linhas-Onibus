import { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim } from './loadingAnim.js';

document.addEventListener('DOMContentLoaded', async () => {
  const tabela = document.getElementById('tabelaFavoritos');
  const vercel = 'https://sistema-monitoramento-linhas-onibus.vercel.app';

  // 🔹 Estilos para animação e clique
  const estilo = document.createElement('style');
  estilo.innerHTML = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-in {
      animation: fadeIn 0.6s ease forwards;
    }
    .linha-clicavel {
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .linha-clicavel:hover {
      background-color: #f3f4f6; /* gray-100 */
    }
  `;
  document.head.appendChild(estilo);

  // 🔹 Verifica se o usuário está logado
  const usuarioLogado = localStorage.getItem('tokenLogin');
  
  if (!usuarioLogado) {
    // colspan="2" pois agora só temos Código e Nome
    tabela.innerHTML = `
      <tr>
        <td colspan="2" class="text-center py-6 text-gray-500 fade-in">
          Faça login para ver suas linhas ⭐
        </td>
      </tr>
    `;
    return;
  }

  // 🔹 Busca os favoritos no Banco de Dados
  try {
    tabela.innerHTML = `<tr><td colspan="2" class="text-center py-6 text-gray-500">Carregando seus favoritos...</td></tr>`;

    const resposta = await fetch(`${vercel}/meus-favoritos`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': `Bearer ${usuarioLogado}`
        }
    });

    if (!resposta.ok) {
        throw new Error('Erro ao buscar favoritos');
    }

    const favoritos = await resposta.json();

    tabela.innerHTML = ''; // Limpa o "Carregando..."

    if (favoritos.length === 0) {
        tabela.innerHTML = `
        <tr>
            <td colspan="2" class="text-center py-8 text-gray-600 text-lg fade-in">
            Você ainda não favoritou nenhuma linha 😢
            </td>
        </tr>
        `;
        return;
    }

    // 🔹 Exibe cada linha favorita (Apenas Código e Nome)
    favoritos.forEach((item, i) => {
        const dadosExibicao = item.exibicao; 

        const tr = document.createElement('tr');
        tr.classList.add('border-b', 'linha-clicavel', 'fade-in');
        tr.style.animationDelay = `${i * 0.05}s`; 

        // Agora só adicionamos 2 colunas
        tr.innerHTML = `
        <td class="text-center py-3 px-6 font-bold text-lg">${dadosExibicao.codigo_exib}</td>
        <td class="text-center py-3 px-6 font-medium text-gray-700">${dadosExibicao.nome_exibicao || 'Sem Nome'}</td>
        `;

        // 🔹 Redirecionar ao clicar
        tr.addEventListener('click', () => {
            const siteUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
            window.location.href = `${siteUrl}exibicao.html?codigo=${dadosExibicao.codigo_exib}`;
        });

        tabela.appendChild(tr);
    });

  } catch (error) {
    console.error(error);
    tabela.innerHTML = `
      <tr>
        <td colspan="2" class="text-center py-6 text-red-500 fade-in">
          Erro ao carregar favoritos. Tente recarregar a página.
        </td>
      </tr>
    `;
  }
});