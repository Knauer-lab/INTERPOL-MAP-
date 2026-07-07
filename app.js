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

style: function(feature) {

  const info =
    countryData[feature.properties.name];

  let color = "#cccccc";

  if(info){

    if(info.redNotice === "Yes")
      color = "#4CAF50";

    else if(info.redNotice === "No")
      color = "#F44336";

    else
      color = "#FFC107";
  }

  return {
    color: "#333",
    weight: 1,
    fillColor: color,
    fillOpacity: 0.6
  };
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
<h2>${country}</h2>

<p><strong>NCB:</strong><br>
${info.ncb || "-"}</p>

<p><strong>Address:</strong><br>
${info.address || "-"}</p>

<p><strong>Red Notice Arrest:</strong><br>
${info.redNotice || "-"}</p>

<p><strong>Red Notice Legal Basis:</strong><br>
${info.redNoticeLaw || "-"}</p>

<p><strong>Diffusion Arrest:</strong><br>
${info.diffusion || "-"}</p>

<p><strong>Diffusion Legal Basis:</strong><br>
${info.diffusionLaw || "-"}</p>

<p><strong>System:</strong><br>
${info.system || "-"}</p>

<p><strong>NCB can exclude notices:</strong><br>
${info.canExclude || "-"}</p>

<p><strong>Access request possible:</strong><br>
${info.requestInfo || "-"}</p>

<p><strong>Warning possible:</strong><br>
${info.warnWantedPerson || "-"}</p>
`;
      });

    }

  }).addTo(map);

});
