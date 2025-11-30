import { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim } from './loadingAnim.js';
import defaultEnv from './_defaultEnv.js';

document.addEventListener('DOMContentLoaded', async () => {
  const tabela = document.getElementById('tabelaLinkLinhas');
  const tituloH1 = document.getElementById('tituloH1');
  const vercel = defaultEnv.API_URL;

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
    .btn-deletar:hover {
        transform: scale(1.1);
    }
    .btn-editar:hover {
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
        const dadosExibicao = item.exibicao || item; 

        const tr = document.createElement('tr');
        tr.classList.add('border-b', 'linha-clicavel', 'fade-in');
        tr.style.animationDelay = `${i * 0.05}s`; 

        // Cria o HTML das colunas de dados
        let htmlLinha = `
        <td class="text-center py-3 px-6 font-bold text-lg hover:text-sptrans transition-all">${dadosExibicao.codigo_exib}</td>
        <td class="text-center py-3 px-6 font-medium text-gray-700">${dadosExibicao.nome_exibicao || 'Sem Nome'}</td>
        `;

        // Lógica para decidir quais botões mostrar na 3ª coluna
        if (tipoPagina === 'exibicoes') {
            // Se for a página de Exibições Criadas: Mostra Editar e Excluir
            htmlLinha += `
            <td class="text-center py-3 px-6 flex justify-center gap-4">
                <a href="configuracao.html?editar=${dadosExibicao.codigo_exib}" 
                   class="btn-editar text-blue-600 hover:text-blue-800 transition-all p-2" 
                   title="Editar">
                   <i class="fas fa-pen text-xl"></i>
                </a>
                <button class="btn-deletar text-red-600 hover:text-red-800 transition-all p-2" 
                        title="Excluir">
                   <i class="fas fa-trash-alt text-xl"></i>
                </button>
            </td>`;
        } else {
            // Se for Favoritos: Mostra botão de desfavoritar (ou vazio)
            htmlLinha += `
            <td class="text-center py-3 px-6">
               <button class="text-gray-400 hover:text-red-500 transition p-2 btn-deletar" title="Remover favorito">
                 <i class="fas fa-times text-xl"></i>
               </button>
            </td>`;
        }

        tr.innerHTML = htmlLinha;

        // Adiciona o clique para abrir a exibição (apenas nas células de texto)
        const celulasTexto = tr.querySelectorAll('td:not(:last-child)');
        celulasTexto.forEach(td => {
            td.addEventListener('click', () => {
                window.location.href = `exibicao.html?codigo=${dadosExibicao.codigo_exib}`;
            });
        });

        // Adiciona evento ao botão de deletar (LÓGICA IMPLEMENTADA AQUI)
        const btnDelete = tr.querySelector('.btn-deletar');
        if (btnDelete) {
            btnDelete.addEventListener('click', async (e) => {
                e.stopPropagation(); // Impede que abra a exibição ao clicar no lixo

                if (tipoPagina === 'exibicoes') {
                    // --- LÓGICA DE EXCLUSÃO (MINHAS EXIBIÇÕES) ---
                    const confirmar = confirm(`Tem certeza que deseja apagar a exibição "${dadosExibicao.nome_exibicao || dadosExibicao.codigo_exib}"?\nEssa ação não pode ser desfeita.`);
                    
                    if (confirmar) {
                        iniciaAnim();
                        setTexto("Excluindo...");
                        
                        try {
                            const resp = await fetch(`${vercel}/deletar-exibicao`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-Access-Token': `Bearer ${usuarioLogado}`
                                },
                                body: JSON.stringify({ codigo_exib: dadosExibicao.codigo_exib })
                            });

                            if(resp.ok) {
                                setTexto("Sucesso!");
                                setSubTexto("Exibição removida.");
                                
                                // Remove a linha da tabela visualmente
                                tr.style.backgroundColor = "#fee2e2"; // vermelho claro
                                setTimeout(() => {
                                    tr.remove();
                                    fechaAnim();
                                    // Se ficou vazio, recarrega para mostrar msg de vazio
                                    if (tabela.children.length === 0) location.reload();
                                }, 1000);
                            } else {
                                const data = await resp.json();
                                throw new Error(data.error || "Erro ao excluir");
                            }
                        } catch (err) {
                            erroAnim();
                            setTexto("Erro");
                            setSubTexto(err.message);
                        }
                    }

                } else {
                    // --- LÓGICA DE DESFAVORITAR (FAVORITOS) ---
                    const confirmar = confirm(`Remover "${dadosExibicao.nome_exibicao || dadosExibicao.codigo_exib}" dos favoritos?`);
                    
                    if(confirmar) {
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

                            if(resp.ok) {
                                setTexto("Removido!");
                                setTimeout(() => {
                                    tr.remove();
                                    fechaAnim();
                                    if (tabela.children.length === 0) location.reload();
                                }, 800);
                            } else {
                                throw new Error("Erro ao remover favorito");
                            }
                        } catch (err) {
                            erroAnim();
                            setSubTexto("Falha na conexão.");
                        }
                    }
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