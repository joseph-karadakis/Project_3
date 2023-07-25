document.addEventListener('DOMContentLoaded', function () {
    var countryDropdown = document.getElementById('country');
    var chartDiv = document.getElementById('chart');

    // Function to generate the line chart
    function generateLineChart(data) {
        var dates = Object.keys(data[0]).slice(4);
        var values = Object.values(data[0]).slice(4);

        var trace = {
            x: dates,
            y: values,
            mode: 'lines+markers',
            type: 'scatter',
            name: 'Confirmed Cases'
        };

        var layout = {
            title: `Confirmed Cases Over Time for ${data[0]['Country/Region']}`,
            xaxis: {
                title: 'Date'
            },
            yaxis: {
                title: 'Confirmed Cases'
            }
        };

        var config = {
            responsive: true
        };

        var chartData = [trace];
        Plotly.newPlot(chartDiv, chartData, layout, config);
    }

    // Function to fetch data for the selected country and generate the chart
    function updateChart() {
        var selectedCountry = countryDropdown.value;
        var url = `/country/${selectedCountry}`;

        fetch(url)
            .then(response => response.json())
            .then(data => generateLineChart(data));
    }

    // Event listener for country dropdown change
    countryDropdown.addEventListener('change', updateChart);

    // Initial chart generation
    updateChart();
});
