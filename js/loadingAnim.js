let nuvemIntervalId = null;

function iniciaAnim() {
    if (!document.getElementById('loadingAnim')) {
        criaBaseAnim();

        criaNuvemAnim();
        nuvemIntervalId = setInterval(criaNuvemAnim, 2500)
    }
}

function fechaAnim() {
    if (nuvemIntervalId) {
        clearInterval(nuvemIntervalId);
        nuvemIntervalId = null;
    }

    const divAnim = document.getElementById('loadingAnim');

    if (divAnim) {
        divAnim.classList.add('animate-shrink');
        // Trocar essa animação para uma mais rapida

        divAnim.addEventListener('animationend', () =>{
            divAnim.remove();
        }, {once: true});
    }
}


function criaBaseAnim() {
    const novaDiv = document.createElement('div'); 

    novaDiv.className = "fixed top-0 left-0 w-full h-full flex items-center justify-center font-roboto-mono z-[800] overflow-hidden backdrop-blur-xs";
    novaDiv.id = "loadingAnim";

    const baseAnim = `
        <div id="loadingBox" class="relative overflow-hidden bg-white border border-gray-800 rounded-xl py-40 max-w-md aspect-square shadow-2xl shadow-black/60 flex flex-col items-center justify-center">
            <img id="campoImg" class="size-24 z-[1000] animate-busJiggle" src="img/bus-svgrepo-com-256.png">
            <p id="campoTextoStatus" class="text-2xl font-extrabold text-black animate-pulse text-center mx-5">Carregando...</p>
            <p id="campoSubTexto" class="text-md text-center font-bold text-black/60 italic mx-10">Por favor, aguarde.</p>
        </div>
    `
    novaDiv.innerHTML = baseAnim;
    document.body.appendChild(novaDiv);
}

function criaNuvemAnim() {
    const divAnim = document.getElementById('loadingBox'); 
    if (!divAnim) return;

    const nuvem = document.createElement('img');

    let tamanho = random(50, 75);
    let topBottom = random(60, 75);

    nuvem.src = "img/cloud-svgrepo-com-1-256.png";
    nuvem.className = `absolute z-[999] animate-fullRightLeft`;

    let duracaoMs = random(2500, 3000);
    
    nuvem.style.width = `${tamanho}px`;
    nuvem.style.bottom = `${topBottom}%`;
    nuvem.style.animation = `fullRightLeft ${duracaoMs}ms linear`;

    nuvem.addEventListener('animationend', () => {
        nuvem.remove();
    });

    divAnim.appendChild(nuvem);
}

function erroAnim() {
    const divAnim = document.getElementById('loadingBox'); 
    if (!divAnim) return; 

    const botaoFechar = document.createElement('div');
    botaoFechar.style.position = "absolute";
    botaoFechar.style.top = "5%";
    botaoFechar.style.right = "5%";
    botaoFechar.innerHTML = `<i class="fas fa-times z-[1000] cursor-pointer text-black hover:text-sptrans transition-all duration-300 ease-out" style='font-size:28px'></i>`;
    
    botaoFechar.addEventListener('click', () => {
        fechaAnim();
    });

    divAnim.appendChild(botaoFechar);


    const campoTextoStatus = document.getElementById('campoTextoStatus'); 
    const campoImg = document.getElementById('campoImg'); 

    if (nuvemIntervalId) {
        clearInterval(nuvemIntervalId);
        nuvemIntervalId = null;
    }
    //Adicionar nessa parte mais coisas relacionadas a erro (botão de fechar, )
    campoImg.classList.remove('animate-busJiggle');
    campoTextoStatus.classList.remove('animate-pulse');
}

function setTexto(texto) {
    const campoTextoStatus = document.getElementById("campoTextoStatus");

    campoTextoStatus.innerText = texto;
}

function setSubTexto(texto) {
    const campoSubTexto = document.getElementById("campoSubTexto");

    campoSubTexto.innerText = texto;
}

function setSimNao(simTexto, naoTexto) {
    return new Promise((resolve) => {
        const divAnim = document.getElementById('loadingBox'); 
        if (!divAnim) {
            resolve(false);
            return; 
        }

    const divMestre = document.createElement('div');
    divMestre.className = `flex flex-row flex-wrap justify-center gap-2 m-2`;
    divAnim.appendChild(divMestre);


    const botaoStyle = `text-black font-bold border-2 border-sptrans
    px-8 py-4 cursor-pointer 
    text-lg
    rounded-2xl shadow-lg 
    hover:bg-sptrans hover:border-black hover:text-white
    focus:ring-2 focus:ring-red-400 focus:ring-opacity-75
    transition-all duration-200 ease-out`;

    const botaoNao = document.createElement('div');
    botaoNao.className = botaoStyle;
    botaoNao.innerText = naoTexto;
    
    botaoNao.addEventListener('click', () => {
        fechaAnim();
        resolve(false); 
    });

    const botaoSim = document.createElement('div');
    botaoSim.className = botaoStyle;
    botaoSim.innerText = simTexto;
        
    botaoSim.addEventListener('click', () => {
        resolve(true);
});

    divMestre.appendChild(botaoSim);
    divMestre.appendChild(botaoNao);
    });
}

function random(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim, setSimNao };