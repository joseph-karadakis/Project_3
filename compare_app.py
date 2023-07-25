from flask import Flask, render_template, request, jsonify
import sqlite3
import pandas as pd
import json

app = Flask(__name__)

# Function to connect to the SQLite database
def get_db_connection():
    conn = sqlite3.connect('database/dashboard_data.db')
    conn.row_factory = sqlite3.Row
    return conn

# Your code for the rest of the app will go here
@app.route('/')
def index():
    # Get a list of all countries from the database
    conn = get_db_connection()
    cursor = conn.execute('SELECT DISTINCT country FROM confirmed ORDER BY country')
    countries = [row['country'] for row in cursor.fetchall()]
    conn.close()

    return render_template('index.html', countries=countries)
@app.route('/compare', methods=['POST'])
def compare():
    country = request.json['country']

    # Get data for the US and the selected country from the database
    conn = get_db_connection()
    cursor = conn.execute('SELECT date, cases FROM confirmed WHERE country = ? ORDER BY date', ('US',))
    us_data = cursor.fetchall()

    cursor = conn.execute('SELECT date, cases FROM confirmed WHERE country = ? ORDER BY date', (country,))
    country_data = cursor.fetchall()
    conn.close()

    # Prepare data for visualization
    data = {
        'US': [{'date': row['date'], 'cases': row['cases']} for row in us_data],
        'SelectedCountry': [{'date': row['date'], 'cases': row['cases']} for row in country_data]
    }

    return jsonify(data)
