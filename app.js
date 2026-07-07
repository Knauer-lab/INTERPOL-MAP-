const map = L.map('map').setView([20, 0], 2);

L.tileLayer(
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; OpenStreetMap'
  }
).addTo(map);

document.getElementById('info').innerHTML =
  '<h3>Test erfolgreich</h3><p>JavaScript funktioniert.</p>';
