
function getUniqueCountries(jsonConfirmed) {
    return [...new Set(jsonConfirmed.map(item => item.Country_Region))];
}

function bubbleChart(selectedCountry) {

    // Extract the required data for the bubble chart
    var filteredData = jsonConfirmed.filter(item => item.Country_Region === selectedCountry);

    // Extract the required data for the line chart
    var xValues = filteredData.map(item => item.date);
    var yValues = filteredData.map(item => item.confirmed_cases);
    var textValues = filteredData.map(item => item.Country_Region);
    var markerSize = filteredData.map(item => Math.sqrt(item.confirmed_cases));
    
    var dateObjects = xValues.map(dateString => new Date(dateString));

    // Sort the dates in chronological order
    var sortedIndices = dateObjects.map((_, index) => index).sort((a, b) => dateObjects[a] - dateObjects[b]);
    xValues = sortedIndices.map(index => xValues[index]);

    // Create the trace for the bubble chart
    var trace = {
        x: xValues,
        y: yValues,
        text: textValues,
        mode: 'markers',
        marker: {
            size: markerSize,
            sizemode: 'area',
            sizeref: 0.005, // Adjust this value to control the size of bubbles
            color: 'blue',
            alpha: 0.50
        }
    };
    
    // Layout for the bubble chart
    var layout = {
        title: 'COVID-19 Confirmed Cases Bubble Chart',
        xaxis: {
            title: 'Date',
            range: [xValues[0], xValues[xValues.length + 1]]
        },
        yaxis: {
            title: 'Confirmed Cases',
            range: [0, Math.max(...yValues)+1000]
        },
        height: 600
    };
    
    // Combine the trace and layout and plot the chart
    Plotly.newPlot('bubble', [trace], layout);
    
    };
    
// Function to create the line chart
function createLineChart(selectedCountry) {
    // Filter data for the selected country
    var filteredData = jsonConfirmed.filter(item => item.Country_Region === selectedCountry);

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
            range: [xValues[0], xValues[xValues.length + 1]]
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
var uniqueCountries = getUniqueCountries(jsonConfirmed);
uniqueCountries.forEach(country => {
    var option = document.createElement('option');
    option.text = country;
    countryDropdown.add(option);
});

// Add an event listener to the dropdown to update the chart on selection change
countryDropdown.addEventListener('change', function () {
    var selectedCountry = countryDropdown.value;
    createLineChart(selectedCountry);
    bubbleChart(selectedCountry);
});

// Initial chart creation with the first country as default
createLineChart(uniqueCountries[0]);
bubbleChart(uniqueCountries[0]);