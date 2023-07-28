
function getUniqueCountries(jsonConfirmed_daily) {
    return [...new Set(jsonConfirmed_daily.map(item => item.Location))];
}
    
// Function to create the line chart
function createLineChart(selectedCountry) {
    // Filter data for the selected country
    var filteredData = jsonConfirmed_daily.filter(item => item.Location === selectedCountry);

    // Extract the required data for the line chart
    var xValues = filteredData.map(item => item.date);
    var yValues = filteredData.map(item => item.confirmed_cases);

    var dateObjects = xValues.map(dateString => new Date(dateString));

    // Sort the dates in chronological order
    var sortedIndices = dateObjects.map((_, index) => index).sort((a, b) => dateObjects[a] - dateObjects[b]);
    xValues = sortedIndices.map(index => xValues[index]);
    
    // Create the trace for the line chart
    var trace = {
        x: xValues,
        y: yValues,
        type: 'scattergl', // Use 'scattergl' for line graph
        mode: 'lines+markers', // Show lines and markers
        line: {
            color: 'blue', // Set the line color
            width: 2 // Set the line width
        },
        marker: {
            color: 'blue', // Set the marker color
            size: 8 // Set the marker size
        }
    };

    // Layout for the line chart
    var layout = {
        title: `COVID-19 Confirmed Cases Line Chart (${selectedCountry})`,
        xaxis: {
            title: 'Date',
            range: [xValues[0], xValues[xValues.length]]
        },
        yaxis: {
            title: 'Confirmed Cases',
            range: [0, Math.max(...yValues)+ (Math.max(...yValues)* 0.10)]
        },
        height: 600
    };

    // Combine the trace and layout and plot the chart
    Plotly.newPlot('line', [trace], layout);
}

// Create the dropdown with unique Country_Region options
var countryDropdown = document.getElementById('country-dropdown');
var uniqueCountries = getUniqueCountries(jsonConfirmed_daily);
uniqueCountries.forEach(country => {
    var option = document.createElement('option');
    option.text = country;
    countryDropdown.add(option);
});

// Add an event listener to the dropdown to update the chart on selection change
countryDropdown.addEventListener('change', function () {
    var selectedCountry = countryDropdown.value;
    createLineChart(selectedCountry);
});

// Initial chart creation with the first country as default
createLineChart(uniqueCountries[0]);