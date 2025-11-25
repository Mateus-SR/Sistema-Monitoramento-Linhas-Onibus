// Variáveis globais para controle
let mapa;
const marcadoresOnibus = {}; // Objeto para guardar os marcadores (Memória do mapa)

// Configuração do ícone do ônibus
const busIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Ícone de exemplo (ônibus amarelo)
    iconSize: [35, 35], // Tamanho em pixels
    iconAnchor: [17, 35], // Ponto do ícone que toca a coordenada (centro inferior)
    popupAnchor: [0, -30] // Onde o balão de texto abre
});

document.addEventListener("DOMContentLoaded", function () {
    // 1. Inicializa o mapa (Centralizado em SP)
    const latitudeInicial = -23.5505;
    const longitudeInicial = -46.6333;

    mapa = L.map('mapa').setView([latitudeInicial, longitudeInicial], 13);

    // 2. Adiciona o visual do mapa (Tiles)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(mapa);
});

// --- FUNÇÃO PÚBLICA PARA RECEBER DADOS ---
// Essa função será chamada pelo seu arquivo inicial.js
window.atualizarMapa = function(listaDeOnibus) {
    if (!mapa) return; // Se o mapa não carregou ainda, para.

    // Verifica se a lista está vazia
    if (!listaDeOnibus || listaDeOnibus.length === 0) return;

    // Loop por cada ônibus que chegou da API
    listaDeOnibus.forEach(onibus => {
        // ADAPTE AQUI: Use os nomes exatos que vêm da sua API (ex: onibus.py, onibus.lat, etc)
        const id = onibus.p || onibus.prefixo; // ID único do veículo
        const lat = onibus.py || onibus.latitude; 
        const lng = onibus.px || onibus.longitude;
        
        // Verifica se as coordenadas são válidas
        if (!lat || !lng) return;

        if (marcadoresOnibus[id]) {
            // CENÁRIO 1: O ônibus já existe no mapa -> Apenas MOVE (Animação)
            marcadoresOnibus[id].setLatLng([lat, lng]);
            
            // Atualiza o texto do popup se quiser
            marcadoresOnibus[id].setPopupContent(`<b>Prefixo:</b> ${id}`);
        } else {
            // CENÁRIO 2: Ônibus novo -> CRIA o marcador
            const novoMarcador = L.marker([lat, lng], {icon: busIcon}).addTo(mapa);
            novoMarcador.bindPopup(`<b>Prefixo:</b> ${id}`);
            
            // Salva na memória
            marcadoresOnibus[id] = novoMarcador;
        }
    });
    
    // Opcional: Centralizar o mapa no primeiro ônibus da lista na primeira vez
    // mapa.setView([listaDeOnibus[0].py, listaDeOnibus[0].px], 15);
};