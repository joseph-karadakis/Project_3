from flask import Flask, render_template, request, jsonify
import sqlite3
import pandas as pd
import json

app = Flask(__name__)

# Function to connect to the SQLite database
def get_db_connection():
    db_file = 'database/dashboard_data.db'
    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        country1 = request.form['country1']
        country2 = request.form['country2']
        selected_table = request.form['table']
    else:
        country1 = 'US'
        country2 = 'India'
        selected_table = 'confirmed'

    # Get a list of all countries from the database
    conn = get_db_connection()
    cursor = conn.execute('SELECT DISTINCT Country_Region FROM confirmed ORDER BY Country_Region')
    countries = [row['Country_Region'] for row in cursor.fetchall()]
    conn.close()

    # Prepare data for visualization
    conn = get_db_connection()
    column_name = 'confirmed_cases' if selected_table == 'confirmed' else 'deaths' if selected_table == 'deaths' else 'recovery'
    cursor = conn.execute(f'SELECT date, SUM({column_name}) as total_cases FROM {selected_table} WHERE Country_Region = ? GROUP BY date ORDER BY date', (country1,))
    country1_data = cursor.fetchall()
    cursor = conn.execute(f'SELECT date, SUM({column_name}) as total_cases FROM {selected_table} WHERE Country_Region = ? GROUP BY date ORDER BY date', (country2,))
    country2_data = cursor.fetchall()
    conn.close()

    data = {
        'Country1': [{'date': row['date'], 'cases': row['total_cases']} for row in country1_data],
        'Country2': [{'date': row['date'], 'cases': row['total_cases']} for row in country2_data]
    }

    return render_template('compare_index.html', countries=countries, tables=['confirmed', 'deaths', 'recovery'],
                           selected_country1=country1, selected_country2=country2, selected_table=selected_table, data=data)

@app.route('/compare', methods=['POST'])
def compare():
    country1 = request.json['country1']
    country2 = request.json['country2']
    table = request.json['table']

    # Get data for the selected countries from the selected table in the database
    conn = get_db_connection()
    column_name = 'confirmed_cases' if table == 'confirmed' else 'deaths' if table == 'deaths' else 'recovery'
    cursor = conn.execute(f'SELECT date, {column_name} FROM {table} WHERE Country_Region = ? ORDER BY date', (country1,))
    country1_data = cursor.fetchall()
    cursor = conn.execute(f'SELECT date, {column_name} FROM {table} WHERE Country_Region = ? ORDER BY date', (country2,))
    country2_data = cursor.fetchall()
    conn.close()

    # Prepare data for visualization
    data = {
        'Country1': [{'date': row['date'], 'cases': row[column_name] // 1000} for row in country1_data],
        'Country2': [{'date': row['date'], 'cases': row[column_name] // 1000} for row in country2_data]
    }

    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)