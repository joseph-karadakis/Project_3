import sqlite3
from flask import Flask, render_template, jsonify

app = Flask(__name__)

# Function to get data from the selected table and date
def get_data(selected_table, selected_date):
    conn = sqlite3.connect("database/dashboard_data.db")
    cursor = conn.cursor()

    # Fetch data from the selected table and date
    cursor.execute(f"SELECT Province_State, Country_Region, Lat, Long, {selected_table} FROM {selected_table} WHERE date=?", (selected_date,))
    data = cursor.fetchall()

    # Get column names of the selected table
    cursor.execute(f"PRAGMA table_info({selected_table})")
    columns_info = cursor.fetchall()
    columns_names = [column[2] for column in columns_info]

    # Choose the last column of the selected table
    last_column = columns_names[-1]

    conn.close()
    return data, last_column

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_dates/<selected_table>')
def send_dates(selected_table):
    conn = sqlite3.connect("database/dashboard_data.db")
    cursor = conn.cursor()

    # Fetch all unique dates for the selected table
    cursor.execute(f"SELECT DISTINCT date FROM {selected_table}")
    dates = [date[0] for date in cursor.fetchall()]

    conn.close()
    return jsonify(dates)

@app.route('/get_data/<selected_table>/<selected_date>')
def send_data(selected_table, selected_date):
    data, last_column = get_data(selected_table, selected_date[:7])

    # Create a list of dictionaries, where each dictionary represents a row of data
    data_list = []
    for row in data:
        data_dict = {
            'Province':row[0],
            'Country': row[1],
            'Lat': row[2],
            'Long': row[3],
            'Cases': row[4]
        }
        data_list.append(data_dict)

    return jsonify(data=data_list, last_column=last_column)

@app.route('/get_deaths_data/deaths/<selected_date>/<lat>/<long>')
def get_deaths_data(selected_date, lat, long):
    conn = sqlite3.connect("database/dashboard_data.db")
    cursor = conn.cursor()

    # Fetch deaths data for the selected date and coordinates
    cursor.execute(f"SELECT deaths FROM deaths WHERE date=? AND lat=? AND long=?", (selected_date, lat, long))
    deaths = cursor.fetchone()

    conn.close()
    return jsonify(deaths=deaths[0])

@app.route('/get_countries')
def get_countries():
    conn = sqlite3.connect("database/dashboard_data.db")
    cursor = conn.cursor()

    # Fetch all unique countries
    cursor.execute("SELECT DISTINCT Country_Region FROM confirmed")
    countries = [country[0] for country in cursor.fetchall()]

    conn.close()
    return jsonify(countries)

@app.route('/get_countries/<selected_table>')
def send_countries(selected_table):
    conn = sqlite3.connect("database/dashboard_data.db")
    cursor = conn.cursor()

    # Fetch all unique countries for the selected table
    cursor.execute(f"SELECT DISTINCT Country_Region FROM {selected_table}")
    countries = [country[0] for country in cursor.fetchall()]

    conn.close()
    return jsonify(countries)

@app.route('/get_comparison_data/<selected_metric>/<country1>/<country2>')
def get_comparison_data(selected_metric, country1, country2):
    conn = sqlite3.connect("database/dashboard_data.db")
    cursor = conn.cursor()

    # Fetch data for the two selected countries and metric
    cursor.execute(f"SELECT date, {selected_metric} FROM {selected_metric} WHERE Country_Region=? AND (date BETWEEN '2020-01-22' AND '2023-12-31') ORDER BY date", (country1,))
    country1_data = cursor.fetchall()

    cursor.execute(f"SELECT date, {selected_metric} FROM {selected_metric} WHERE Country_Region=? AND (date BETWEEN '2020-01-22' AND '2023-12-31') ORDER BY date", (country2,))
    country2_data = cursor.fetchall()

    conn.close()

    data = {
        country1: {row[0]: row[1] for row in country1_data},
        country2: {row[0]: row[1] for row in country2_data},
    }

    return jsonify(data=data)

if __name__ == '__main__':
    app.run(debug=True)
