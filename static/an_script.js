function bubbleChart(jsonConfirmed) {

// Extract the required data for the bubble chart
var xValues = jsonConfirmed.map(item => item.date);
var yValues = jsonConfirmed.map(item => item.confirmed_cases);
var textValues = jsonConfirmed.map(item => item.Country_Region);
var markerSize = jsonConfirmed.map(item => Math.sqrt(item.confirmed_cases));

// Create the trace for the bubble chart
var trace = {
    x: xValues,
    y: yValues,
    text: textValues,
    mode: 'markers',
    marker: {
        size: markerSize,
        sizemode: 'area',
        sizeref: 0.01, // Adjust this value to control the size of bubbles
        color: 'blue',
        alpha: 0.50
    }
};

// Layout for the bubble chart
var layout = {
    title: 'COVID-19 Confirmed Cases Bubble Chart',
    xaxis: {
        title: 'Date'
    },
    yaxis: {
        title: 'Confirmed Cases'
    }
};

// Combine the trace and layout and plot the chart
Plotly.newPlot('bubble', [trace], layout);

};