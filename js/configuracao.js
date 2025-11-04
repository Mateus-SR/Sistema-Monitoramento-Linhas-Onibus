import { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim, setSimNao } from './loadingAnim.js';


document.addEventListener('DOMContentLoaded', () => {
    const ConfiguraçãoForm = document.getElementById('ConfiguraçãoForm');
    const botaoAdicionar = document.getElementById('botaoAdicionar');
    const botaoRemover = document.getElementById('botaoRemover');
    const botaoSalvar = document.getElementById('botaoSalvar');
    const codParadaOG = document.getElementById('codParada_1');

    const vercel = `https://sistema-monitoramento-linhas-onibus.vercel.app`;
    
    let counterFieldAdiciona = 1;
    verificaEstado();

    botaoAdicionar.addEventListener('click', () =>{
        if (counterFieldAdiciona <= 4) {
            const novocodParada = codParadaOG.cloneNode(true);
            
            counterFieldAdiciona++;
            novocodParada.id = 'codParada_' + counterFieldAdiciona;
            
            novocodParada.value = '';

            if (novocodParada.classList.contains('bg-sptrans/25')) {
                novocodParada.classList.remove('bg-sptrans/25')
            };

            ConfiguraçãoForm.appendChild(novocodParada);

            verificaEstado();
        }
    });

    const campoCodErro = (input) => {
        input.classList.add('bg-sptrans/25');
    }

    const campoCodCorreto = (input) => {
        input.classList.remove('bg-sptrans/25');
    }


    botaoRemover.addEventListener('click', () => {
        if (counterFieldAdiciona >= 2) {

            let codParadaRecente = document.getElementById(`codParada_${counterFieldAdiciona}`)
 
            
            if (codParadaRecente) {
                codParadaRecente.classList.remove("animate-LTRfadeIn");
                codParadaRecente.classList.add("animate-LTRfadeOut");


                
                codParadaRecente.addEventListener('animationend', () => {
                    codParadaRecente.remove();
                    counterFieldAdiciona--;
                    verificaEstado();
                }, { once: true });
            }
        }
    });

    botaoSalvar.addEventListener('click', (e) => {

        e.preventDefault();
        salvarExibicao();
    });

    ConfiguraçãoForm.addEventListener('input', (e) => {
        if (e.target.classList.contains('campoCodParada')) {
            const input = e.target;

            input.value = input.value.replace(/\D/g, '');
            
            if (input.value.length > 0 && input.value.length !== 9) {
                campoCodErro(input);
            } else {
                campoCodCorreto(input);
            }
        }
    });

    ConfiguraçãoForm.addEventListener('focusout', (e) => {
        if (e.target.classList.contains('campoCodParada')) {
            const input = e.target;

            if (input.value.length > 0 && input.value.length !== 9) {
                campoCodErro(input);
            } else {
                campoCodCorreto(input);
            }
        }
    });

function verificaEstado() {
    if (counterFieldAdiciona == 5) {
        botaoAdicionar.classList.remove('text-black');
        botaoAdicionar.classList.add('text-gray-400');

        botaoAdicionar.classList.remove('hover:text-sptrans');
        
        botaoAdicionar.classList.remove('cursor-pointer');
        botaoAdicionar.classList.add('cursor-not-allowed');
    } else if (counterFieldAdiciona == 1) {
        botaoRemover.classList.remove('text-black');
        botaoRemover.classList.add('text-gray-400');

        botaoRemover.classList.remove('hover:text-sptrans');
        
        botaoRemover.classList.remove('cursor-pointer');
        botaoRemover.classList.add('cursor-not-allowed');
    } else {
        botaoAdicionar.classList.add('text-black');
        botaoAdicionar.classList.remove('text-gray-400');

        botaoAdicionar.classList.add('hover:text-sptrans');

        botaoAdicionar.classList.add('cursor-pointer');
        botaoAdicionar.classList.remove('cursor-not-allowed');


        botaoRemover.classList.add('text-black');
        botaoRemover.classList.remove('text-gray-400');

        botaoRemover.classList.add('hover:text-sptrans');

        botaoRemover.classList.add('cursor-pointer');
        botaoRemover.classList.remove('cursor-not-allowed');
    }
};

async function salvarExibicao() {
    iniciaAnim();
    setTexto("Validando dados...");


    const nome = document?.getElementById('nomeExib').value;

    let formularioValido = true;

    const todosCodigos = document.querySelectorAll('.campoCodParada');

    // Estamos usando um loop "for" ou inves do "forEach" pois o for permite que usemos "break" para cancelar a execução do codigo. "forEach" não permite.
    for (const cadaUm of todosCodigos) {
        const valido = cadaUm.value.length === 9 && !cadaUm.classList.contains('bg-sptrans/25');
        if (!valido) {
            formularioValido = false;
            break;
        }
    };

    if (!formularioValido) {
        erroAnim();
        setTexto("Oops! Erro!!")
        setSubTexto("Verifique se todos os códigos foram inseridos corretamente.")
        return;
    }


    const arrayCodigos = Array.from(todosCodigos).map(cadaUm => cadaUm.value);

    try {
        const tokenLogin = localStorage.getItem('tokenLogin');
        const dados = { 
            nome_exibicao: nome,
            codigos_parada: arrayCodigos
        };

        // Manda pra url ali de cima o post com os dados inseridos no formulario
        const resposta = await fetch(`${vercel}/cria-exibicao`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Token': `Bearer ${tokenLogin}`
            },
            body: JSON.stringify(dados), 
        });

        setTexto("Enviando dados...");

        const dadosResposta = await resposta.json();
        // Se tudo estiver ok...
        if (resposta.ok) { // ('ok' significa status 200-299 (sucesso)) 

            setTexto("Exibição criada com sucesso!")
            setSubTexto("Gostaria de acessá-la agora?")

            const codigoCriado = dadosResposta.codigo_exib;

            const confirma = await setSimNao("Acessar", "Depois");
            if (confirma) {
                window.location.href = `../exibicao.html?codigo=${codigoCriado}`;
            } else {
                console.log("Função ainda não implementada...")
            }
        
        // E se for qualquer outra coisa, dá erro
        } else {
            const erroMsg = dadosResposta.error;
            setTexto("Oops! Erro!!");
            setSubTexto(erroMsg)
            erroAnim();
        }
    } catch (error) {
        setTexto("Oops! Erro!!");
        setSubTexto(`Falha ao conectar com o servidor: ${error}`);
        erroAnim();
        //alert('Não foi possível se conectar ao servidor. Tente novamente mais tarde.');
    };

};


});