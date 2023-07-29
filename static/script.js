// Global variables
let map;
let markersLayer; 

// Function to initialize the map
function initMap() {
  map = L.map('map').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
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
  axios
    .get(`/get_data/${selectedTable}/${selectedDate}`)
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

// Function to clear markers when re entering the tab
function handleMapVisualization() {
  markersLayer.clearLayers();
  // Call handleTableSelectChange to reset the dropdowns
  handleTableSelectChange();
}

// Function to handle the "tableSelect" dropdown change event
function handleTableSelectChange() {
  const selectedTable = document.getElementById('tableSelect').value;
  axios
    .get(`/get_dates/${selectedTable}`)
    .then((response) => {
      const dates = response.data;
      const dateSelect = document.getElementById('dateSelect');
      dateSelect.innerHTML = '<option value="" selected disabled>Select Date</option>';
      dates.forEach((date) => {
        const option = document.createElement('option');
        option.value = date; // Set the option value to the original date string
        option.text = formatDate(date); // Format the date string as "January 2021"
        dateSelect.add(option);
      });
      dateSelect.disabled = false;
    })
    .catch((error) => {
      console.error('Error fetching dates:', error);
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
    if (!selectedDate) {
      console.log('Please select a date before generating the map.');
      return;
    }
    
    // Check if markersLayer is initialized, if not, initialize it now.
    if (!markersLayer) {
      markersLayer = L.layerGroup().addTo(map);
    }

    plotBtn.dataset.selectedTable = selectedTable;
    fetchData(selectedTable, selectedDate.slice(0, 7));
  });

  // Event listener for the "tableSelect" dropdown to populate the "dateSelect" dropdown
  const tableSelect = document.getElementById('tableSelect');
  tableSelect.addEventListener('change', handleTableSelectChange);

  // Load table data by default (for the "Confirmed Cases" table)
  handleTableSelectChange();

  // Event listener for tab changes
  const navTabs = document.querySelectorAll('.nav-tabs .nav-link');
  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('href');
      if (target === '#mapContent') {
        handleMapVisualization();
      } else if (target === '#visualization2Content') {
        handleVisualization2();
      } else if (target === '#visualization3Content') {
        handleVisualization3();
      }
    });
  });
});