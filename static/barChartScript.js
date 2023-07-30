 
 // Global variables
let barChart;

 // Function to populate the country dropdowns with options
 function populateCountryDropdowns(countryData) {
  const countrySelect1 = document.getElementById("countrySelect1");
  const countrySelect2 = document.getElementById("countrySelect2");
  // Sort the countryData array alphabetically
  countryData.sort();
  // Add new options based on the received country data
  countryData.forEach((country) => {
    const option1 = document.createElement("option");
    const option2 = document.createElement("option");
    option1.value = country;
    option2.value = country;
    option1.textContent = country;
    option2.textContent = country;
    countrySelect1.appendChild(option1);
    countrySelect2.appendChild(option2);
  });
}

// Function to format dates from "YYYY-MM" to "Month Year"
function formatDateYYYYMMToMonthYear(dateString) {
  const [year, month] = dateString.split('-');
  const formattedDate = new Date(year, month - 1);
  return formattedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}

// Draws a bar chart with the data for the selected countries and table
function drawChartWithData(data, country1, country2) {
  const chartContainer = document.getElementById("barChart");
  chartContainer.innerHTML = ""; // Clear any existing content

  // Set a fixed height for the chart container
  chartContainer.style.height = "400px";

  // Get the dates and cases data for both countries
  const dates = Object.keys(data[country1]);
  const cases1 = Object.values(data[country1]);
  const cases2 = Object.values(data[country2]);

  // Convert dates to "Month Year" format
  const formattedDates = dates.map(formatDateYYYYMMToMonthYear);

  // Set up the chart data
  const chartData = {
    labels: formattedDates,
    datasets: [
      {
        label: country1,
        data: cases1,
        backgroundColor: "#FF5722",
        borderColor: "#f76a05",
        borderWidth: 1,
      },
      {
        label: country2,
        data: cases2,
        backgroundColor: "#3dd93b",
        borderColor: "#02c920",
        borderWidth: 1,
      },
    ],
  };

  // Set up the chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      position: "top",
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Cases",
        },
        suggestedMin: 0,
        suggestedMax: Math.max(...cases1, ...cases2) * 1.2,
      },
    },
    plugins: {
      zoom: {
        wheel: {
          enabled: true,
        },
        drag: {
          enabled: true,
        },
        pinch: {
          enabled: true,
        },
        mode: "xy", // Enable zooming in both X and Y directions
      },
    },
  };

  // Clear the previous chart instance if exists
  if (barChart) {
    barChart.destroy();
  }

  // Create the bar chart
  barChart = new Chart(chartContainer.getContext("2d"), {
    type: "bar",
    data: chartData,
    options: options,
  });

  // Add the zoom plugin to the chart instance
  Chart.register(ChartZoom);
}

// Function to reset the country dropdowns to their initial state
function resetCountryDropdowns() {
  const countrySelect1 = document.getElementById("countrySelect1");
  const countrySelect2 = document.getElementById("countrySelect2");

  // Disable "Select Country" option and reset selected index to 0
  countrySelect1.selectedIndex = 0;
  countrySelect1.disabled = true;

  countrySelect2.selectedIndex = 0;
  countrySelect2.disabled = true;
}

// Function to handle the metric selection change in the Country Comparison tab
function handleComparisonMetricSelectChange() {
  const selectedTable = document.getElementById("comparisonMetricSelect").value;
  const countrySelect1 = document.getElementById("countrySelect1");
  const countrySelect2 = document.getElementById("countrySelect2");

  // Reset the country dropdowns when a new metric is selected
  resetCountryDropdowns();
  // resetBarChart();

  if (!selectedTable) {
    return;
  }

  // Fetch the countries for the selected metric from the server
  axios
    .get(`/get_countries/${selectedTable}`)
    .then((response) => {
      const countryData = response.data;
      populateCountryDropdowns(countryData);

      // Enable the country dropdowns since a metric is selected
      countrySelect1.disabled = false;
      countrySelect2.disabled = false;
    })
    .catch((error) => {
      console.error("Error fetching countries:", error);
    });
}


// Sends a POST request to the server with the selected countries and table and calls the function to draw the chart with the returned data
function compareData() {
  const selectedCountry1 = document.getElementById("countrySelect1").value;
  const selectedCountry2 = document.getElementById("countrySelect2").value;
  const selectedTable = document.getElementById("comparisonMetricSelect").value;
  console.log("Selected countries:", selectedCountry1, selectedCountry2);
  // Check if all three dropdowns have a valid selection
  if (!selectedCountry1 || !selectedCountry2 || !selectedTable) {
    // Display a pop-up alert if any of the dropdowns are not selected
    alert("Please select two locations and a metric to see the comparative data.");
    return;
  }
  // Proceed with fetching data and drawing the chart if all dropdowns have valid selections
  console.log("Selected countries:", selectedCountry1, selectedCountry2);

  axios
    .get(`/get_comparison_data/${selectedTable}/${selectedCountry1}/${selectedCountry2}`)
    .then((response) => {
      const data = response.data.data;
      console.log("Received data:", data);
      drawChartWithData(data, selectedCountry1, selectedCountry2);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      // Display an error message
      const chartContainer = document.getElementById("barChart");
      chartContainer.innerHTML = '<p class="text-danger">Error fetching data. Please try again later.</p>';
    });
}
// Function to handle click on the "Country Comparison" tab
function handleComparisonTabClick() {
  console.log("Here")
  resetBarChart(); // Reset the bar chart and dropdowns when entering the tab
}

// Function to reset the bar chart and dropdowns
function resetBarChart() {
  if (barChart) {
    barChart.destroy(); // Destroy the existing bar chart
    barChart = null;
  }

  // Reset the dropdowns to their default (first) options
  const comparisonMetricSelect = document.getElementById('comparisonMetricSelect');
  comparisonMetricSelect.selectedIndex = 0;

  const countrySelect1 = document.getElementById('countrySelect1');
  countrySelect1.selectedIndex = 0;

  const countrySelect2 = document.getElementById('countrySelect2');
  countrySelect2.selectedIndex = 0;
}
// Load the Google Charts library and execute the bar chart script once it's loaded
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(function () {
  // Add event listeners and other chart-related code here
  document.getElementById("compareBtn").addEventListener("click", compareData);
  document.getElementById("comparisonMetricSelect").addEventListener("change", handleComparisonMetricSelectChange);

  // Trigger the metric selection change event on page load (to populate the country dropdowns for the default metric)
  handleComparisonMetricSelectChange();
});
// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Event listener for the metric selection change
  const comparisonMetricSelect = document.getElementById("comparisonMetricSelect");
  comparisonMetricSelect.addEventListener('change', handleComparisonMetricSelectChange);

  // Event listener for the "Compare" button click
  const compareBtn = document.getElementById("compareBtn");
  compareBtn.addEventListener('click', compareData);
});