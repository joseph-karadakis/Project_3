// Loading the Google Charts package
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

// Sends a POST request to the server with the selected countries and table and calls the function to draw the chart with the returned data
function compareData() {
    const selectedCountry1 = document.getElementById("country1").value;
    const selectedCountry2 = document.getElementById("country2").value;
    const selectedTable = document.getElementById("table").value;
    fetch("/compare", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            country1: selectedCountry1,
            country2: selectedCountry2,
            table: selectedTable
        })
    })
    .then(response => response.json())
    .then(data => {
        drawChartWithData(data, selectedCountry1, selectedCountry2);
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    });
}

// Draws a bar chart with the data for the selected countries and table
function drawChartWithData(data, country1, country2) {
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Date');
    dataTable.addColumn('number', country1);
    dataTable.addColumn({type: 'string', role: 'style'});
    dataTable.addColumn('number', country2);
    dataTable.addColumn({type: 'string', role: 'style'});
    
    // Add data rows for the chart
    var rows = [];
    var data1 = data['Country1'];
    var data2 = data['Country2'];
    var length = Math.max(data1.length, data2.length);
    for (let i = 0; i < length; i++) {
        var date1 = data1[i] ? data1[i].date : '';
        var cases1 = data1[i] ? data1[i].cases : 0;
        var date2 = data2[i] ? data2[i].date : '';
        var cases2 = data2[i] ? data2[i].cases : 0;
        rows.push([date1, cases1, 'color: blue', cases2, 'color: red']);
    }
    dataTable.addRows(rows);

    // Sets options for the chart
    var options = {
        title: 'COVID-19 Cases Comparison',
        legend: { position: 'top' },
        bars: 'vertical',
        vAxis: { title: 'Cases', viewWindow: { min: 0.1 } },
        hAxis: { title: 'Date', showTextEvery: 1, slantedText: true },
        tooltip: { trigger: 'both' } // Show tooltip for both bars and data points
    };
    // Draws the chart in the specified div
    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
    chart.draw(dataTable, options);
}