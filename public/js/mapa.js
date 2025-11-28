// Variáveis globais
let mapa;
const marcadoresOnibus = {}; 
let marcadorPonto = null; // Variável para guardar o marcador do ponto fixo

// Ícones
const busIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -30]
});

// Ícone para o Ponto de Ônibus (Azul, por exemplo)
const stopIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Ícone de "Ponto"
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

document.addEventListener("DOMContentLoaded", function () {
    const containerMapa = document.getElementById('mapa');
    if (!containerMapa) return;

    // Inicia com uma visão padrão de SP (será atualizada logo)
    mapa = L.map('mapa').setView([-23.5505, -46.6333], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(mapa);
});

// --- NOVA FUNÇÃO: Centralizar e Marcar o Ponto ---
window.definirPontoFixo = function(lat, lng, nome) {
    if (!mapa) return;

    // Se já temos um marcador de ponto, não faz nada (para não resetar o zoom do usuário)
    if (marcadorPonto) return; 

    // Cria o marcador do ponto
    marcadorPonto = L.marker([lat, lng], {icon: stopIcon, zIndexOffset: 1000}).addTo(mapa);
    marcadorPonto.bindPopup(`<b>Ponto:</b> ${nome}<br><b>Código:</b> ${lat}, ${lng}`).openPopup();

    // Centraliza o mapa no ponto APENAS UMA VEZ
    mapa.setView([lat, lng], 16);
};

window.atualizarMapa = function(listaDeOnibus) {
    if (!mapa || !listaDeOnibus || listaDeOnibus.length === 0) return;

    listaDeOnibus.forEach(onibus => {
        const id = onibus.prefixo; 
        const lat = onibus.latitude; 
        const lng = onibus.longitude;
        const linha = onibus.linha || "Linha";

        if (!lat || !lng) return;

        if (marcadoresOnibus[id]) {
            marcadoresOnibus[id].setLatLng([lat, lng]);
            marcadoresOnibus[id].setPopupContent(`<b>Linha:</b> ${linha}<br><b>Prefixo:</b> ${id}`);
        } else {
            const novoMarcador = L.marker([lat, lng], {icon: busIcon}).addTo(mapa);
            novoMarcador.bindPopup(`<b>Linha:</b> ${linha}<br><b>Prefixo:</b> ${id}`);
            marcadoresOnibus[id] = novoMarcador;
        }
    });
};