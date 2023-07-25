document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch the data for the selected column from the Flask route
    function updateMap(selectedColumn) {
        fetch('/column/' + selectedColumn)
            .then(response => response.json())
            .then(data => {
                let myMap = L.map('map').setView([-32.8, 117.9], 7);

                // Adding the tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(myMap);

                let heatArray = data.map(row => [row.Lat, row.Long, row[selectedColumn]]);

                let heat = L.heatLayer(heatArray, {
                    radius: 20,
                    blur: 35,
                    maxZoom: 18,
                }).addTo(myMap);
            });
    }

    // Call the updateMap function with the default selected column
    updateMap(document.getElementById('column').value);

    // Add an event listener to the dropdown list to update the map when a new column is selected
    document.getElementById('column').addEventListener('change', function() {
        updateMap(this.value);
    });
});
