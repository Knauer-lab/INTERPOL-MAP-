const map = L.map('map').setView([20, 0], 2);

L.tileLayer(
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; OpenStreetMap'
  }
).addTo(map);

Promise.all([
  fetch('countries.json').then(r => r.json()),
  fetch('world.geojson').then(r => r.json())
]).then(([countryData, worldData]) => {

  L.geoJSON(worldData, {

    style: {
      color: '#333',
      weight: 1,
      fillColor: '#4a90e2',
      fillOpacity: 0.5
    },

    onEachFeature: function(feature, layer) {

      layer.on('click', function() {

        const country = feature.properties.name;

        const info = countryData[country];

        if (!info) {

          document.getElementById('info').innerHTML =
            `<h3>${country}</h3><p>Keine Daten vorhanden.</p>`;

          return;
        }

        document.getElementById('info').innerHTML = `
          <h3>${country}</h3>
          <p><b>NCB:</b> ${info.ncb}</p>
          <p><b>Red Notice:</b> ${info.redNotice}</p>
          <p><b>Diffusion:</b> ${info.diffusion}</p>
        `;
      });

    }

  }).addTo(map);

});
