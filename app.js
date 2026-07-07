layer.on("click", function() {
    console.log(feature.properties);
});

L.tileLayer(
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; OpenStreetMap'
  }
).addTo(map);

document.getElementById('info').innerHTML =
  'Die Karte wurde erfolgreich geladen.';
