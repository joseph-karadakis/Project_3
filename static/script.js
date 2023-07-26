// Global variables
let map;
let markersLayer;

// Function to initialize the map
function initMap() {
  map = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  markersLayer = L.layerGroup().addTo(map); // Add this line to create the markersLayer
  console.log("Map initialized successfully.");
}
// Function to get the marker color based on mortality rate
function getMarkerColor(mortalityRate) {
  // Use D3 scale to map the mortality rate to a color range
  const colorScale = d3.scaleLinear().domain([0, 10]).range(["#FF9800", "#E91E63"]);
  return colorScale(mortalityRate);
}

// Function to update the markers on the map
async function updateMarkers(data) {
  // Clear any existing markers from the map
  markersLayer.clearLayers();

  for (const row of data) {
    const lat = row.Lat;
    const long = row.Long;
    const cases = row.Cases;
    const country = row.Country;
    const provinceState = row.Province;
    console.log(provinceState)

    // Check if lat, long, and cases are valid numbers
    if (!isNaN(lat) && !isNaN(long) && !isNaN(cases)) {
      // Fetch deaths data for the selected date and coordinates
      const selectedDate = document.getElementById('dateSelect').value;
      const deaths = await getDeathsData(selectedDate, lat, long);

      // Calculate mortality rate
      const mortalityRate = ((deaths / cases) * 100).toFixed(2);
      const formattedMortalityRate = mortalityRate + "%";

      // Format cases and deaths numbers with commas
      const formattedCases = cases.toLocaleString();
      const formattedDeaths = deaths.toLocaleString();

      // Create a circle marker for each data point
      const marker = L.circleMarker([lat, long], {
        radius: Math.log(cases) * 1,
        color: '#FF5722',
        fillColor: getMarkerColor(mortalityRate),
        fillOpacity: 0.7,
      });

      

      // Add a tooltip to display information
      if (provinceState !== "unknown"){
        marker.bindTooltip(
        `Country: ${country}<br>Province/State: ${provinceState}<br>Cases: ${formattedCases}<br>Deaths: ${formattedDeaths}<br>Mortality Rate: ${mortalityRate}%`
      ).openTooltip();
      } else {
        marker.bindTooltip(`Country: ${country}<br>Cases: ${formattedCases}<br>Deaths: ${formattedDeaths}<br>Mortality Rate: ${mortalityRate}%`);
      }

      // Add the marker to the markers layer
      markersLayer.addLayer(marker);
    } else {
      console.log(`Invalid data: Lat: ${lat} Long: ${long} Cases: ${cases}`);
    }
  }

  console.log("Markers updated successfully.");
}

// Function to fetch deaths data from the server
async function getDeathsData(selectedDate, lat, long) {
  try {
    const response = await axios.get(`/get_deaths_data/deaths/${selectedDate}/${lat}/${long}`);
    return response.data.deaths;
  } catch (error) {
    console.error("Error fetching deaths data:", error);
    return 0;
  }
}

// Function to fetch data from the server
function fetchData(selectedTable, selectedDate) {
  axios.get(`/get_data/${selectedTable}/${selectedDate}`)
    .then((response) => {
      const data = response.data.data;
      console.log("Data from server:", data);
      updateMarkers(data);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
}

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  initMap();

  // Event listener for the "Generate Map" button
  const plotBtn = document.getElementById('plotBtn');
  plotBtn.addEventListener('click', () => {
    const selectedTable = document.getElementById('tableSelect').value;
    const selectedDate = document.getElementById('dateSelect').value;
    plotBtn.dataset.selectedTable = selectedTable;
    fetchData(selectedTable, selectedDate.slice(0, 7));
  });

  // Event listener for the "tableSelect" dropdown to populate the "dateSelect" dropdown
  const tableSelect = document.getElementById('tableSelect');
  tableSelect.addEventListener('change', () => {
    const selectedTable = tableSelect.value;
    axios.get(`/get_dates/${selectedTable}`)
      .then((response) => {
        const dates = response.data;
        const dateSelect = document.getElementById('dateSelect');
        dateSelect.innerHTML = '<option value="" selected disabled>Select Date</option>';
        dates.forEach((date) => {
          const option = document.createElement('option');
          option.text = date;
          dateSelect.add(option);
        });
        dateSelect.disabled = false;
      })
      .catch((error) => {
        console.error('Error fetching dates:', error);
      });
  });
});

