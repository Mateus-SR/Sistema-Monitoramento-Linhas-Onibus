
import { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim } from './loadingAnim.js';

document.addEventListener('DOMContentLoaded', async () => {
  const tabela = document.getElementById('tabelaLinkLinhas');
  const tituloH1 = document.getElementById('tituloH1');
  const vercel = 'https://sistema-monitoramento-linhas-onibus.vercel.app';

  // Pega o tipo de página que estamos, mas com "favoritos" sendo um failsafe
  const tipoPagina = document.body.dataset.type || 'favoritos';

  // Configurando o que cada tipo de página tem
  const config = {
    favoritos: {
        tituloH1: 'Seus favoritos:',
        rota: '/meus-favoritos',
        msgCarregando: 'Carregando seus favoritos...',
        msgVazio: 'Você ainda não favoritou nenhuma linha 😢',
        msgErro: 'Erro ao carregar favoritos.'
    },
    exibicoes: {
        tituloH1: 'Suas exibições:',
        rota: '/get-usuario-exibicoes',
        msgCarregando: 'Carregando suas exibições...',
        msgVazio: 'Você ainda não criou nenhuma exibição 📂',
        msgErro: 'Erro ao carregar suas exibições.'
    }
  };

  const contexto = config[tipoPagina];
  tituloH1.innerText = contexto.tituloH1;

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
    .btn-delete:hover {
        color: #dc2626; /* red-600 */
        transform: scale(1.1);
    }
  `;
  document.head.appendChild(estilo);

  // 🔹 Verifica se o usuário está logado
  const usuarioLogado = localStorage.getItem('tokenLogin') || sessionStorage.getItem('tokenLogin');
  
  if (!usuarioLogado) {
    tabela.innerHTML = `
      <tr>
        <td colspan="3" class="text-center py-6 text-gray-500 fade-in">
          Faça login para ver suas linhas
        </td>
      </tr>
    `;
    return;
  }

  // 🔹 Busca os dados no Banco de Dados
  try {
    const colspan = tipoPagina === 'favoritos' ? 3 : 2;
    tabela.innerHTML = `<tr><td colspan="${colspan}" class="text-center py-6 text-gray-500">${contexto.msgCarregando}</td></tr>`;

    // Usa a rota dinâmica
    const resposta = await fetch(`${vercel}${contexto.rota}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': `Bearer ${usuarioLogado}`
        }
    });

    if (!resposta.ok) {
        throw new Error('Erro na requisição');
    }

    const listaDados = await resposta.json();

    tabela.innerHTML = ''; // Limpa o "Carregando..."

    if (listaDados.length === 0) {
        const colspan = tipoPagina === 'favoritos' ? 3 : 2;
        tabela.innerHTML = `
        <tr>
            <td colspan="${colspan}" class="text-center py-8 text-gray-600 text-lg fade-in">
            ${contexto.msgVazio}
            </td>
        </tr>
        `;
        return;
    }

    // 🔹 Exibe cada linha
    listaDados.forEach((item, i) => {
        // IMPORTANTE:
        // Se for favoritos, o dado está em 'item.exibicao'.
        // Se for exibições criadas, o dado é o próprio 'item'.
        const dadosExibicao = item.exibicao || item; 

        const tr = document.createElement('tr');
        tr.classList.add('border-b', 'linha-clicavel', 'fade-in');
        tr.style.animationDelay = `${i * 0.05}s`; 

        // Cria o HTML base da linha
        let htmlLinha = `
        <td class="text-center py-3 px-6 font-bold text-lg hover:text-sptrans transition-all duration-300 ease-in-out">${dadosExibicao.codigo_exib}</td>
        <td class="text-center py-3 px-6 font-medium text-gray-700">${dadosExibicao.nome_exibicao || 'Sem Nome'}</td>
        `;

        // Se for página de favoritos, adiciona a célula do botão de excluir
        if (tipoPagina === 'favoritos') {
            htmlLinha += `
            <td class="text-center py-3 px-6">
                <button class="btn-delete text-gray-400 transition-all duration-200 p-2" title="Remover dos favoritos">
                    <i class="fas fa-trash-alt text-xl"></i>
                </button>
            </td>
            `;
        }

        tr.innerHTML = htmlLinha;

        // 🔹 Redirecionar ao clicar na LINHA
        tr.addEventListener('click', () => {
            window.location.href = `exibicao.html?codigo=${dadosExibicao.codigo_exib}`;
        });

        // 🔹 Lógica do botão de excluir (Somente se for favoritos)
        if (tipoPagina === 'favoritos') {
            const btnDelete = tr.querySelector('.btn-delete');
            btnDelete.addEventListener('click', async (e) => {
                e.stopPropagation(); // 🛑 Impede que o clique na lixeira abra a exibição

                if(!confirm(`Deseja remover "${dadosExibicao.nome_exibicao || dadosExibicao.codigo_exib}" dos favoritos?`)) {
                    return;
                }

                iniciaAnim();
                setTexto("Removendo...");

                try {
                    const resp = await fetch(`${vercel}/desfavoritar`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Access-Token': `Bearer ${usuarioLogado}`
                        },
                        body: JSON.stringify({ codigo_exib: dadosExibicao.codigo_exib })
                    });

                    if (resp.ok) {
                        // Remove visualmente a linha com uma animação
                        tr.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        tr.style.opacity = '0';
                        tr.style.transform = 'translateX(20px)';
                        setTimeout(() => tr.remove(), 300);
                        
                        setTexto("Removido!");
                        setTimeout(fechaAnim, 800);
                    } else {
                        throw new Error("Erro ao remover");
                    }
                } catch (error) {
                    erroAnim();
                    setTexto("Erro!");
                    setSubTexto("Não foi possível remover o favorito.");
                    console.error(error);
                }
            });
        }

        tabela.appendChild(tr);
    });

  } catch (error) {
    console.error(error);
    const colspan = tipoPagina === 'favoritos' ? 3 : 2;
    tabela.innerHTML = `
      <tr>
        <td colspan="${colspan}" class="text-center py-6 text-red-500 fade-in">
          ${contexto.msgErro} <br> Tente recarregar a página.
        </td>
      </tr>
    `;
  }
});
