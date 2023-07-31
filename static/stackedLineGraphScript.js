// Declare global variables to hold the datasets and dropdowns
let confirmed_data, deaths_data, recovery_data;
let countryDropdown, confirmedCheckbox, deathsCheckbox, recoveriesCheckbox; // Declare dropdown and checkbox variables in the global scope

// Function to initialize the dropdown with unique countries
function initializeDropdown(allData) {
  // Fetch unique countries from the combined dataset and sort them alphabetically
  let uniqueCountries = getUniqueCountries(allData).sort();

  // Create the country dropdown without duplicates
  countryDropdown.innerHTML = '<option value="">Select Country</option>'; // Reset dropdown to show "Select Country"

  uniqueCountries.forEach(country => {
    let option = document.createElement('option');
    option.text = country;
    countryDropdown.add(option);
  });
}

// Function to fetch unique countries from the data
function getUniqueCountries(data) {
  return [...new Set(data.map(item => item.Location))];
}

// Function to create the Plotly chart
function createPlotlyChart(selectedCountryChart) {
  // Filter data for the selected country based on the datasets
  let confirmedData = confirmed_data.filter(item => item.Location === selectedCountryChart);
  let deathsData = deaths_data.filter(item => item.Location === selectedCountryChart);
  let recoveryData = recovery_data.filter(item => item.Location === selectedCountryChart);

  // Extract the required data for each dataset
  let confirmedXValues = confirmedData.map(item => item.date);
  let confirmedY = confirmedData.map(item => item.cases);

  let deathsXValues = deathsData.map(item => item.date);
  let deathsY = deathsData.map(item => item.cases);

  let recoveryXValues = recoveryData.map(item => item.date);
  let recoveryY = recoveryData.map(item => item.cases);

  // Create traces based on checkboxes
  let traces = [];
  if (confirmedCheckbox.checked) {
    traces.push({
      x: confirmedXValues,
      y: confirmedY,
      type: 'scattergl',
      mode: 'lines',
      line: { width: 2, color: 'blue' },
      name: 'Confirmed Cases',
      fill: 'tozeroy', // Add fill below the line
      fillcolor: 'rgba(0, 0, 255, 0.45)' // Set blue color with 30% transparency
    });
  }

  if (deathsCheckbox.checked) {
    traces.push({
      x: deathsXValues,
      y: deathsY,
      type: 'scattergl',
      mode: 'lines',
      line: { width: 2, color: 'red' },
      name: 'Deaths',
      fill: 'tozeroy', // Add fill below the line
      fillcolor: 'rgba(255, 0, 0, 0.45)' // Set red color with 30% transparency
    });
  }

  if (recoveriesCheckbox.checked) {
    traces.push({
      x: recoveryXValues,
      y: recoveryY,
      type: 'scattergl',
      mode: 'lines',
      line: { width: 2, color: 'green' },
      name: 'Recoveries',
      fill: 'tozeroy', // Add fill below the line
      fillcolor: 'rgba(0, 128, 0, 0.45)' // Set green color with 30% transparency
    });
  }

  // Layout for the Plotly chart
  let layout = {
    title: `Record of COVID-19 Cases (${selectedCountryChart})`,
    xaxis: {
      title: 'Date',
      range: [confirmedXValues[0], confirmedXValues[confirmedXValues.length - 1]] // Use the first and last dates for range
    },
    yaxis: {
      title: 'Cases',
      range: [0, Math.max(...confirmedY, ...deathsY, ...recoveryY) + 100]
    },
    height: 600,
    showlegend: true, // Show the legend for toggling datasets
    plot_bgcolor: 'rgba(0,0,0,0)', // Set the plot background to transparent
    paper_bgcolor: 'rgba(0,0,0,0)' // Set the paper background (area outside the plot) to transparent

  };

  // Combine the traces and layout and plot the chart
  Plotly.newPlot('line-stack', traces, layout);
}

// Function to update the chart based on the selected values
function updateChart() {
  let selectedCountryChart = countryDropdown.value;
  createPlotlyChart(selectedCountryChart);
}

// Function to handle the "Chart Data" button click event
function handleChartButtonClick() {
  let selectedCountryChart = countryDropdown.value;
  if (selectedCountryChart !== "") {
    createPlotlyChart(selectedCountryChart);
  } else {
    // Show an alert or some message to prompt the user to select a country
    alert("Please select a country from the dropdown.");
  }
}

// Function to reset the dropdown and destroy the chart
function resetDropdownAndChart() {
  // Clear the chart by clearing the 'line-stack' div
  document.getElementById('line-stack').innerHTML = '';

  // Reset the dropdown to show "Select Country"
  countryDropdown.value = "";

  // Uncheck the checkboxes by default
  confirmedCheckbox.checked = false;
  deathsCheckbox.checked = false;
  recoveriesCheckbox.checked = false;
}

// Event listener for the tab "Covid through Time"
document.getElementById('visualization3Tab').addEventListener('click', resetDropdownAndChart);

// Fetch data and create dropdowns
Promise.all([
  d3.json('../database/jsonData/daily_confirmed_data.js'),
  d3.json('../database/jsonData/daily_deaths_data.js'),
  d3.json('../database/jsonData/daily_recovery_data.js')
]).then(function (data) {
  // Assign data to variables
  confirmed_data = data[0];
  deaths_data = data[1];
  recovery_data = data[2];

  // Combine all datasets into one array
  let allData = confirmed_data.concat(deaths_data, recovery_data);

  // Initialize the country dropdown
  countryDropdown = document.getElementById('country-dropdown');
  initializeDropdown(allData);

  // Get the checkboxes
  confirmedCheckbox = document.getElementById('confirmedCheckbox');
  deathsCheckbox = document.getElementById('deathsCheckbox');
  recoveriesCheckbox = document.getElementById('recoveriesCheckbox');

  // Add event listeners for checkboxes
  confirmedCheckbox.addEventListener('change', updateChart);
  deathsCheckbox.addEventListener('change', updateChart);
  recoveriesCheckbox.addEventListener('change', updateChart);

  // Add event listener for "Chart Data" button
  document.getElementById('chart-button').addEventListener('click', handleChartButtonClick);
});
