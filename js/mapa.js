document.addEventListener("DOMContentLoaded", function () {
  // Coordenadas iniciais (exemplo: São Paulo)
  const latitude = -23.5505;
  const longitude = -46.6333;

  // Inicializa o mapa no elemento com id="mapa"
  const mapa = L.map('mapa').setView([latitude, longitude], 13);

  // Adiciona a camada de tiles (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(mapa);

  // Adiciona um marcador de exemplo
  L.marker([latitude, longitude]).addTo(mapa)
    .bindPopup('<b>Você está aqui!</b><br>São Paulo')
    .openPopup();
});