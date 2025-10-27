let nuvemIntervalId = null;

function iniciaAnim() {
    if (!document.getElementById('loadingAnim')) {
        criaBaseAnim();

        criaNuvemAnim();
        nuvemIntervalId = setInterval(criaNuvemAnim, 2500)
    }
}

function cancelaAnim() {
    if (nuvemIntervalId) {
        clearInterval(nuvemIntervalId);
        nuvemIntervalId = null;
    }

    const divAnim = document.getElementById('loadingAnim');
    if (divAnim) {
        divAnim.remove();
    }
}


function criaBaseAnim() {
    const novaDiv = document.createElement('div'); 

    novaDiv.className = "fixed top-0 left-0 w-full h-full flex items-center justify-center font-roboto-mono z-[800] overflow-hidden";
    novaDiv.id = "loadingAnim";

    const baseAnim = `
        <div id="loadingBox" class="relative overflow-hidden bg-white border border-gray-800 rounded-xl py-40 aspect-square shadow-2xl shadow-black/60 flex flex-col items-center justify-center">
            <img class="size-24 z-[1000] animate-busJiggle" src="img/bus-svgrepo-com-256.png">
            <p class="text-2xl font-extrabold text-black animate-pulse">Carregando...</p>
            <p class="text-md font-bold text-black/60 italic">Por favor, aguarde.</p>
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
function random(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { iniciaAnim, cancelaAnim };