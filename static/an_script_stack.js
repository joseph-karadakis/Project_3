// Function to fetch unique countries from the data
function getUniqueCountries(data) {
    return [...new Set(data.map(item => item.Location))];
  }
  
  // Function to create the line chart
  function createStackedLineChart(selectedCountry, dataset) {
    // Filter data for the selected country based on the dataset
    var data;
    switch (dataset) {
      case 'confirmed':
        data = confirmed_data.filter(item => item.Location === selectedCountry);
        break;
      case 'deaths':
        data = deaths_data.filter(item => item.Location === selectedCountry);
        break;
      case 'recovery':
        data = recovery_data.filter(item => item.Location === selectedCountry);
        break;
      default:
        data = confirmed_data.filter(item => item.Location === selectedCountry);
    }
  
    // Extract the required data for the line chart
    var xValues = data.map(item => item.date);
    var yValues = data.map(item => item.cases);

    var dateObjects = xValues.map(dateString => new Date(dateString));

    // Sort the dates in chronological order
    var sortedIndices = dateObjects.map((_, index) => index).sort((a, b) => dateObjects[a] - dateObjects[b]);
    xValues = sortedIndices.map(index => xValues[index]);
    
    // Create the trace for the stacked line chart
    var trace = {
        x: xValues,
        y: yValues,
        type: 'scattergl', // Use 'scattergl' for line graph
        mode: 'lines', // Show only lines for stacked line graph
        stackgroup: 'one', // Assign a stackgroup to create the stacking effect
        line: {
            width: 2 // Set the line width
        }
    };

    // Layout for the stacked line chart
    var layout = {
        title: `COVID-19 Confirmed Cases Stacked Line Chart (${selectedCountry})`,
        xaxis: {
            title: 'Date',
            range: [xValues[0], xValues[xValues.length - 1]] // Use the first and last dates for range
        },
        yaxis: {
            title: 'Confirmed Cases',
            range: [0, Math.max(...yValues) + (Math.max(...yValues) * 0.10)]
        },
        height: 600
    };

    // Combine the trace and layout and plot the chart
    Plotly.newPlot('line-stack', [trace], layout);
}

// Fetch data and create dropdowns
Promise.all([
    d3.json('../JSON Data/confirmed_data.js'),
    d3.json('../JSON Data/deaths_data.js'),
    d3.json('../JSON Data/recovery_data.js')
  ]).then(function (data) {
  // Assign data to variables
  var confirmed_data = data[0];
  var deaths_data = data[1];
  var recovery_data = data[2];

  // Combine all datasets into one array
  var allData = confirmed_data.concat(deaths_data, recovery_data);

 // Fetch unique countries from the combined dataset
var uniqueCountries = getUniqueCountries(allData);

// Create the country dropdown
var countryDropdown = document.getElementById('country-dropdown');
uniqueCountries.forEach(country => {
  var option = document.createElement('option');
  option.text = country;
  countryDropdown.add(option);
});

// Create the dataset dropdown
var datasetDropdown = document.getElementById('dataset-dropdown');
var datasets = ['confirmed', 'deaths', 'recovery'];

// Use a Set to store unique datasets
var uniqueDatasets = new Set(datasets);

// Clear the existing options in the dropdown
datasetDropdown.innerHTML = '';

// Add unique datasets to the dropdown
uniqueDatasets.forEach(dataset => {
  var option = document.createElement('option');
  option.text = dataset;
  datasetDropdown.add(option);
});

  // Add event listener for both dropdowns
  countryDropdown.addEventListener('change', updateChart);
  datasetDropdown.addEventListener('change', updateChart);

  // Initial chart creation with the first country and dataset as default
  var selectedCountry = uniqueCountries[0];
  var selectedDataset = datasets[0];
  createStackedLineChart(selectedCountry, selectedDataset);
});
