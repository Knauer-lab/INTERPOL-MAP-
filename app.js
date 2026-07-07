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
  "Limited": "#FF9800",
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
// COUNTRY NAME MAPPING
// ============================================================================
// Maps GeoJSON names to countries.json keys

const COUNTRY_NAME_MAP = {
  "Germany": "Germany",
  "France": "France",
  "Portugal": "Portugal",
  "Austria": "Austria",
  "Spain": "Spain",
  "Italy": "Italy",
  "Netherlands": "Netherlands",
  "Belgium": "Belgium",
  "Switzerland": "Switzerland",
  "Poland": "Poland",
  "United Kingdom": "United Kingdom",
  "Greece": "Greece",
  "Estonia": "Estonia",
  "Lithuania": "Lithuania",
  "Croatia": "Croatia",
  "Romania": "Romania",
  "Serbia": "Serbia",

  "Albania": "Albania",
  "Armenia": "Armenia",

  "Czechia": "Czech Republic",
  "Czech Republic": "Czech Republic",

  "Slovakia": "Slovakia",

  "Turkey": "Turkey",
  "Türkiye": "Turkey",

  "United States": "United States of America",
  "United States of America": "United States of America"
};

// ============================================================================
// GLOBAL STATE
// ============================================================================

let geoJSONLayer = null;
let countryDataGlobal = {};
let worldDataGlobal = {};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the mapped country name from GeoJSON feature name
 * @param {string} geoJSONName - The name from GeoJSON properties
 * @returns {string|null} - The mapped name from countries.json or null
 */
const getMappedCountryName = (geoJSONName) => {
  return COUNTRY_NAME_MAP[geoJSONName] || null;
};

/**
 * Determines the fill color based on the Red Notice status
 * @param {string} redNoticeStatus - The status value (Yes/No/Unknown/Limited)
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

/**
 * Highlights a country on the map and displays its info
 * @param {string} countryName - Name of the country to highlight (from countries.json)
 */
const highlightCountry = (countryName) => {
  const infoElement = document.getElementById('info');
  let found = false;
  
  geoJSONLayer.eachLayer((layer) => {
    const geoJSONName = layer.feature.properties.name;
    const mappedName = getMappedCountryName(geoJSONName);
    
    if (mappedName === countryName) {
      found = true;
      // Highlight the selected country
      layer.setStyle({
        weight: 3,
        color: '#000',
        fillOpacity: 0.8
      });
      
      // Display info
      const info = countryDataGlobal[countryName];
      infoElement.innerHTML = generateInfoHTML(countryName, info);
      
      // Zoom to the country
      map.fitBounds(layer.getBounds());
    } else {
      // Reset other countries
      const info = countryDataGlobal[mappedName];
      const fillColor = info ? getFillColor(info.redNotice) : RED_NOTICE_COLORS["Default"];
      
      layer.setStyle({
        color: STYLE_CONFIG.borderColor,
        weight: STYLE_CONFIG.borderWeight,
        fillColor: fillColor,
        fillOpacity: STYLE_CONFIG.fillOpacity
      });
    }
  });
  
  if (!found) {
    infoElement.innerHTML = `<p>Keine Daten für ${countryName} vorhanden.</p>`;
  }
};

/**
 * Resets all country styles to default
 */
const resetStyles = () => {
  geoJSONLayer.eachLayer((layer) => {
    const geoJSONName = layer.feature.properties.name;
    const mappedName = getMappedCountryName(geoJSONName);
    const info = countryDataGlobal[mappedName];
    const fillColor = info ? getFillColor(info.redNotice) : RED_NOTICE_COLORS["Default"];
    
    layer.setStyle({
      color: STYLE_CONFIG.borderColor,
      weight: STYLE_CONFIG.borderWeight,
      fillColor: fillColor,
      fillOpacity: STYLE_CONFIG.fillOpacity
    });
  });
};

// ============================================================================
// SEARCH FUNCTIONALITY
// ============================================================================

const setupSearch = (countryData) => {
  const searchInput = document.getElementById('search');
  
  if (!searchInput) return;
  
  // Get list of countries from data
  const countries = Object.keys(countryData).sort();
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
      resetStyles();
      document.getElementById('info').innerHTML = '<p>Wählen Sie ein Land aus oder suchen Sie danach.</p>';
      return;
    }
    
    // Find matching countries
    const matches = countries.filter(country => 
      country.toLowerCase().includes(query)
    );
    
    if (matches.length > 0) {
      // Highlight the first match
      highlightCountry(matches[0]);
    } else {
      resetStyles();
      document.getElementById('info').innerHTML = '<p>Keine Länder gefunden.</p>';
    }
  });
};

// ============================================================================
// MAIN APPLICATION
// ============================================================================

Promise.all([
  fetch('countries.json').then(r => r.json()),
  fetch('world.geojson').then(r => r.json())
]).then(([countryData, worldData]) => {

  const infoElement = document.getElementById('info');
  
  // Store globally for search functionality
  countryDataGlobal = countryData;
  worldDataGlobal = worldData;

  geoJSONLayer = L.geoJSON(worldData, {

    style: (feature) => {
      const geoJSONName = feature.properties.name;
      const mappedName = getMappedCountryName(geoJSONName);
      const info = mappedName ? countryData[mappedName] : null;
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
        const geoJSONName = feature.properties.name;
        const mappedName = getMappedCountryName(geoJSONName);
        
        if (mappedName) {
          const info = countryData[mappedName];
          infoElement.innerHTML = generateInfoHTML(mappedName, info);
        } else {
          infoElement.innerHTML = `<h3>${geoJSONName}</h3><p>Keine Daten vorhanden.</p>`;
        }
      });
      
      // Hover effect
      layer.on('mouseover', () => {
        layer.setStyle({
          weight: 2,
          color: '#666'
        });
      });
      
      layer.on('mouseout', () => {
        const geoJSONName = feature.properties.name;
        const mappedName = getMappedCountryName(geoJSONName);
        const info = mappedName ? countryData[mappedName] : null;
        const fillColor = info ? getFillColor(info.redNotice) : RED_NOTICE_COLORS["Default"];
        
        layer.setStyle({
          color: STYLE_CONFIG.borderColor,
          weight: STYLE_CONFIG.borderWeight,
          fillColor: fillColor
        });
      });
    }

  }).addTo(map);
  
  // Initialize search functionality
  setupSearch(countryData);

});
