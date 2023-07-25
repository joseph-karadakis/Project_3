document.addEventListener('DOMContentLoaded', function() {
    let myMap = L.map('map').setView([0, 0], 2);

    // Adding the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(myMap);

    let heat = null;

    // Function to fetch the data for the selected table and date from the Flask route
    function updateMap(selectedTable, selectedDate) {
        fetch(`/data/${selectedTable}/${selectedDate}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('Data is not in the expected format');
                }

                if (heat !== null) {
                    myMap.removeLayer(heat);
                }

                console.log(data); // Debug: Check the data format received from the server

                let heatArray = data.map(row => [row.Lat, row.Long, row[selectedTable]]);
                console.log(heatArray); // Debug: Check the heatArray format

                heat = L.heatLayer(heatArray, {
                    radius: 20,
                    blur: 35,
                    maxZoom: 18,
                    gradient: {
                        0.4: 'green',
                        0.6: 'yellow',
                        1.0: 'red',
                    },
                }).addTo(myMap);
            })
            .catch(error => {
                console.error('Error:', error.message);
            });
    }

    // Get the default selected table and date
    const selectedTable = document.getElementById('table').value;
    const selectedDate = document.getElementById('date').value;

    // Call the updateMap function with the default selected table and date
    updateMap(selectedTable, selectedDate);

    // Add event listeners to the dropdown lists to update the map when a new table or date is selected
    document.getElementById('table').addEventListener('change', function() {
        const selectedTable = this.value;
        const selectedDate = document.getElementById('date').value;
        updateMap(selectedTable, selectedDate);
    });

    document.getElementById('date').addEventListener('change', function() {
        const selectedTable = document.getElementById('table').value;
        const selectedDate = this.value;
        updateMap(selectedTable, selectedDate);
    });
});
