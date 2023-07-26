from flask import Flask, jsonify
import json
import pandas as pd
import sqlite3

app = Flask(__name__)
@app.route('/')
@app.route('/dashboard_data', methods=['GET'])

def dashboard_data():
    conn = sqlite3.connect('dashboard_data.db')
    # Query each of the tables
    confirmed_query = 'SELECT * FROM confirmed;'
    deaths_query = 'SELECT * FROM deaths;'
    recovery_query = 'SELECT * FROM recovery;'

    # Use Pandas to read the data from the database
    confirmed_df = pd.read_sql_query(confirmed_query, conn)
    deaths_df = pd.read_sql_query(deaths_query, conn)
    recovery_df = pd.read_sql_query(recovery_query, conn)

    conn.close()

    # Convert the data to JSON format
    confirmed_json = confirmed_df.to_dict(orient='records')
    deaths_json = deaths_df.to_dict(orient='records')
    recovery_json = recovery_df.to_dict(orient='records')

    # Create a dictionary to store the data and return it as JSON
    data = {
        "confirmed": confirmed_json,
        "deaths": deaths_json,
        "recovery": recovery_json
    }

    return json.dumps(data)

if __name__ == '__main__':
    app.run(debug=True)

