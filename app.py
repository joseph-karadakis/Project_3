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
    columns_names = [column[1] for column in columns_info]

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
            'Lat': row[2],
            'Long': row[3],
            'Cases': row[4]
        }
        data_list.append(data_dict)

    return jsonify(data=data_list, last_column=last_column)

if __name__ == '__main__':
    app.run(debug=True)
