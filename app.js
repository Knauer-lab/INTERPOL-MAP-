const map = L.map('map').setView([20, 0], 2);

L.tileLayer(
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; OpenStreetMap'
  }
).addTo(map);

document.getElementById('info').innerHTML =
  '<h3>✅ JavaScript funktioniert</h3><p>Die Verbindung zwischen HTML und app.js ist erfolgreich.</p>';
