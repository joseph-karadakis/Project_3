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

function updateMarkers(data) {
  // Remove any existing markers from the map
  markersLayer.clearLayers();

  data.forEach((row) => {
      const lat = row.Lat;
      const long = row.Long;
      const cases = row.Cases;

      // Check if lat, long, and cases are valid numbers
      if (!isNaN(lat) && !isNaN(long) && !isNaN(cases)) {
          // Use a logarithmic scale for the radius
          const radius = Math.log(cases) * 1;

          // Create a circle marker for each data point
          const marker = L.circleMarker([lat, long], {
              radius: radius,
              color: '#FF5722',
              fillColor: '#FF9800',
              fillOpacity: 0.7,
          });

          // Add a tooltip to display the number of cases
          marker.bindTooltip(`Cases: ${cases}`).openTooltip();

          // Add the marker to the markers layer
          markersLayer.addLayer(marker);
      } else {
          console.log(`Invalid data: Lat: ${lat} Long: ${long} Cases: ${cases}`);
      }
  });

  // Add the markers layer to the map
  map.addLayer(markersLayer);

  console.log("Markers updated successfully.");
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
