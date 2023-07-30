// Global variables
let map;
let markersLayer;
let mapContainer; // Declare mapContainer as a global variable

// Function to initialize the map
function initMap() {
  if (!map) {
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    markersLayer = L.layerGroup().addTo(map);
  }
}

// Function to deinitialize the map
function deinitMap() {
  if (map) {
    map.remove();
    map = null;
  }
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

    // Check if lat, long, and cases are valid numbers
    if (!isNaN(lat) && !isNaN(long) && !isNaN(cases)) {
      // Format cases numbers with commas
      const formattedCases = cases.toLocaleString();

      // Create a circle marker for each data point
      const marker = L.circleMarker([lat, long], {
        radius: Math.log(cases) * 0.75,
        color: '#FF5722',
        fillOpacity: 0.7,
      });

      // Add a tooltip to display information
      if (provinceState !== 'unknown') {
        marker.bindTooltip(
          `<strong>Country:</strong><strong>${country}</strong><br>Province/State: ${provinceState}<br>Cases: ${formattedCases}`
        ).openTooltip();
      } else {
        marker.bindTooltip(
          `<strong>Country:</strong><strong>${country}</strong><br>Cases: ${formattedCases}`
        );
      }

      // Add a click event listener to the marker
      marker.on("click", () => {
        const url = `https://coronavirus.jhu.edu/region/${encodeURIComponent(country)}`;
        window.open(url, "_blank");
      });

      // Add the marker to the markers layer
      markersLayer.addLayer(marker);
    } else {
      console.log(`Invalid data: Lat: ${lat} Long: ${long} Cases: ${cases}`);
    }
  }
  console.log('Markers updated successfully.');
}

// Function to fetch data from the server
function fetchData(selectedTable, selectedDate) {
  const formattedDate = selectedDate.slice(0, 7);
  axios
    .get(`/get_data/${selectedTable}/${formattedDate}`)
    .then((response) => {
      const data = response.data.data;
      console.log('Data from server:', data);
      updateMarkers(data);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
}

// Function to format the date in String
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

// Function to clear markers and deinitialize the map when leaving the tab
function handleMapVisualization() {
  const mapContainer = document.getElementById('map');
  mapContainer.style.display = 'none'; // Hide the map container
  markersLayer.clearLayers(); // Remove markers from the map if any exist
  deinitMap();
  // Reset the dropdowns when leaving the map tab
  resetDropdowns();
}

// Function to handle click on the "Global Snapshot" tab
function handleMapTabClick() {
  if (mapContainer && mapContainer.style.display === 'none') {
    // If the map is already hidden, it means the tab was clicked again. No action needed.
    return;
  }
  handleMapVisualization();
}

function resetDropdowns() {
  // Reset the "tableSelect" dropdown to its default (first) option
  const tableSelect = document.getElementById('tableSelect');
  tableSelect.selectedIndex = 0;
  tableSelect.disabled = false; // Enable the "Select Metric" dropdown

  // Clear the "dateSelect" dropdown and add a default disabled option
  const dateSelect = document.getElementById('dateSelect');
  dateSelect.innerHTML = '<option value="" selected disabled>Select Date</option>';
  dateSelect.disabled = true; // Disable the "Select Date" dropdown
}

function handleTableSelectChange() {
  const selectedTable = document.getElementById('tableSelect').value;
  axios
    .get(`/get_dates/${selectedTable}`) // Use the correct endpoint here
    .then((response) => {
      const dates = response.data;
      const dateSelect = document.getElementById('dateSelect');
      dateSelect.innerHTML = '<option value="" selected disabled>Select Date</option>';
      dates.forEach((date) => {
        const option = document.createElement('option');
        option.value = date;
        option.text = formatDate(date);
        dateSelect.add(option);
      });
      dateSelect.disabled = false; // Enable the "Select Date" dropdown once data is fetched
    })
    .catch((error) => {
      console.error('Error fetching dates:', error);
    });
}

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  function showErrorPopup(message) {
    alert(message);
  }

  // Event listener for the "Show me the Data!" button
  const plotBtn = document.getElementById('plotBtn');
  plotBtn.addEventListener('click', () => {
    const selectedTable = document.getElementById('tableSelect').value;
    const selectedDate = document.getElementById('dateSelect').value;
    if (!selectedTable || !selectedDate) { // Check if both metric and date are selected
      const errorMessage = 'Please select both a metric and date to see data on the map.';
      showErrorPopup(errorMessage);
      return;
    }

    // Always show the map container when clicking the "Show me the Data!" button
    const mapContainer = document.getElementById('map');
    mapContainer.style.display = 'block';

    // Initialize the map if it's not already initialized
    if (!map) {
      initMap();
    }

    // Check if markersLayer is initialized, if not, initialize it now.
    if (!markersLayer) {
      markersLayer = L.layerGroup().addTo(map);
    }

    fetchData(selectedTable, selectedDate.slice(0, 7));
  });

  resetDropdowns();
// Event listener for the "Global Snapshot" tab click
const mapTab = document.getElementById('mapTab');
mapTab.addEventListener('click', handleMapTabClick);
  // Event listener for the "tableSelect" dropdown to populate the "dateSelect" dropdown
  const tableSelect = document.getElementById('tableSelect');
  tableSelect.addEventListener('change', handleTableSelectChange);
});
