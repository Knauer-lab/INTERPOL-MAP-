const map = L.map('map').setView([20, 0], 2);

L.tileLayer(
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; OpenStreetMap'
  }
).addTo(map);

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

const STYLE_CONFIG = {
  borderColor: "#333",
  borderWeight: 1,
  fillOpacity: 0.6
};

const RED_NOTICE_COLORS = {
  "Yes": "#4CAF50",
  "No": "#F44336",
  "Unknown": "#FFC107",
  "Default": "#cccccc"
};

const INFO_FIELDS = [
  { label: "NCB", key: "ncb" },
  { label: "Address", key: "address" },
  { label: "Red Notice Arrest", key: "redNotice" },
  { label: "Red Notice Legal Basis", key: "redNoticeLaw" },
  { label: "Diffusion Arrest", key: "diffusion" },
  { label: "Diffusion Legal Basis", key: "diffusionLaw" },
  { label: "System", key: "system" },
  { label: "NCB can exclude notices", key: "canExclude" },
  { label: "Access request possible", key: "requestInfo" },
  { label: "Warning possible", key: "warnWantedPerson" }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determines the fill color based on the Red Notice status
 * @param {string} redNoticeStatus - The status value (Yes/No/Unknown)
 * @returns {string} - Hex color code
 */
const getFillColor = (redNoticeStatus) => {
  return RED_NOTICE_COLORS[redNoticeStatus] || RED_NOTICE_COLORS["Default"];
};

/**
 * Generates HTML content for the info panel
 * @param {string} country - Country name
 * @param {object} info - Country data object
 * @returns {string} - HTML string
 */
const generateInfoHTML = (country, info) => {
  if (!info) {
    return `<h3>${country}</h3><p>Keine Daten vorhanden.</p>`;
  }

  const fieldsHTML = INFO_FIELDS
    .map(field => `<p><strong>${field.label}:</strong><br>${info[field.key] || "-"}</p>`)
    .join('');

  return `<h2>${country}</h2>${fieldsHTML}`;
};

// ============================================================================
// MAIN APPLICATION
// ============================================================================

Promise.all([
  fetch('countries.json').then(r => r.json()),
  fetch('world.geojson').then(r => r.json())
]).then(([countryData, worldData]) => {

  const infoElement = document.getElementById('info');

  L.geoJSON(worldData, {

    style: (feature) => {
      const info = countryData[feature.properties.name];
      const fillColor = info ? getFillColor(info.redNotice) : RED_NOTICE_COLORS["Default"];

      return {
        color: STYLE_CONFIG.borderColor,
        weight: STYLE_CONFIG.borderWeight,
        fillColor: fillColor,
        fillOpacity: STYLE_CONFIG.fillOpacity
      };
    },

    onEachFeature: (feature, layer) => {
      layer.on('click', () => {
        const country = feature.properties.name;
        const info = countryData[country];
        infoElement.innerHTML = generateInfoHTML(country, info);
      });
    }

  }).addTo(map);

});
