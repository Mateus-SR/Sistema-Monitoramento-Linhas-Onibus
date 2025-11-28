import { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim } from './loadingAnim.js';

document.addEventListener('DOMContentLoaded', async () => {
  const tabela = document.getElementById('tabelaLinkLinhas');
  const tituloH1 = document.getElementById('tituloH1');
  const vercel = 'https://sistema-monitoramento-linhas-onibus.vercel.app';

  // Pega o tipo de página que estamos, mas com "favoritos" sendo um failsafe (caso não ache ou não tenha nada)
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
  `;
  document.head.appendChild(estilo);

  // 🔹 Verifica se o usuário está logado
  const usuarioLogado = localStorage.getItem('tokenLogin') || sessionStorage.getItem('tokenLogin');
  
  if (!usuarioLogado) {
    tabela.innerHTML = `
      <tr>
        <td colspan="2" class="text-center py-6 text-gray-500 fade-in">
          Faça login para ver suas linhas
        </td>
      </tr>
    `;
    return;
  }

  // 🔹 Busca os dados no Banco de Dados
  try {
    // Usa a mensagem dinâmica
    tabela.innerHTML = `<tr><td colspan="2" class="text-center py-6 text-gray-500">${contexto.msgCarregando}</td></tr>`;

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
        tabela.innerHTML = `
        <tr>
            <td colspan="2" class="text-center py-8 text-gray-600 text-lg fade-in">
            ${contexto.msgVazio}
            </td>
        </tr>
        `;
        return;
    }

    // 🔹 Exibe cada linha (Apenas Código e Nome)
    listaDados.forEach((item, i) => {
        // IMPORTANTE:
        // Se for favoritos, o dado está em 'item.exibicao'.
        // Se for exibições criadas, o dado é o próprio 'item'.
        // (isso se deve à forma de como o backend devolve o dados)
        const dadosExibicao = item.exibicao || item; 

        const tr = document.createElement('tr');
        tr.classList.add('border-b', 'linha-clicavel', 'fade-in');
        tr.style.animationDelay = `${i * 0.05}s`; 

        tr.innerHTML = `
        <td class="text-center py-3 px-6 font-bold text-lg hover:text-sptrans transition-all duration-300 ease-in-out">${dadosExibicao.codigo_exib}</td>
        <td class="text-center py-3 px-6 font-medium text-gray-700">${dadosExibicao.nome_exibicao || 'Sem Nome'}</td>
        `;

        // 🔹 Redirecionar ao clicar
        tr.addEventListener('click', () => {
            // Caminho relativo seguro
            //const siteUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
            //window.location.href = `${siteUrl}exibicao.html?codigo=${dadosExibicao.codigo_exib}`;
            
            // Sugestão mais simples que funciona no GitHub Pages e Localhost:
            window.location.href = `exibicao.html?codigo=${dadosExibicao.codigo_exib}`;
        });

        tabela.appendChild(tr);
    });

  } catch (error) {
    console.error(error);
    tabela.innerHTML = `
      <tr>
        <td colspan="2" class="text-center py-6 text-red-500 fade-in">
          ${contexto.msgErro} <br> Tente recarregar a página.
        </td>
      </tr>
    `;
  }
});