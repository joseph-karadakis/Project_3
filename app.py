from flask import Flask, render_template, jsonify, request
import sqlite3
import pandas as pd
import plotly.graph_objs as go
import json

app = Flask(__name__)

# Function to connect to the SQLite database
def get_db_connection():
    conn = sqlite3.connect('database/dashboard_data.db')
    conn.row_factory = sqlite3.Row
    return conn

# Function to get the confirmed cases data for a specific country
def get_confirmed_data(conn, country='US'):
    query = f"SELECT * FROM confirmed WHERE `Country/Region` = '{country}';"
    df_confirmed = pd.read_sql_query(query, conn)
    
    # Rename the last column to a valid date format
    columns = df_confirmed.columns.tolist()
    columns[-1] = "March/23"
    df_confirmed.columns = columns
    
    return df_confirmed

# Home page route
@app.route('/')
def index():
    conn = get_db_connection()
    countries = conn.execute("SELECT DISTINCT `Country/Region` FROM confirmed;").fetchall()
    conn.close()

    return render_template('index.html', countries=countries)

# Route to get confirmed cases data for a specific country
@app.route('/country/<country>')
def get_country_data(country):
    conn = get_db_connection()
    df_confirmed = get_confirmed_data(conn, country)
    conn.close()

    # Convert the DataFrame to a JSON string
    data_json = df_confirmed.to_json(orient='records')
    data = json.loads(data_json)

    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
