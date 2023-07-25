from flask import Flask, render_template, jsonify, make_response
import sqlite3
import pandas as pd
import json

app = Flask(__name__)

# Function to connect to the SQLite database
def get_db_connection():
    conn = sqlite3.connect('database/dashboard_data.db')
    conn.row_factory = sqlite3.Row
    return conn

# Function to get data for a specific table and date
def get_data(conn, table, date='2023-01-01'):
    table_column = table.replace(' ', '_')  # Replace spaces in table name with underscores
    query = f"SELECT `Country_Region`, `Lat`, `Long`, `{table_column}` FROM {table} WHERE date=?;"
    df_data = pd.read_sql_query(query, conn, params=[date])
    return df_data.to_dict(orient='records')

# Home page route
@app.route('/')
def index():
    conn = get_db_connection()
    tables = ['confirmed', 'deaths', 'recovery']
    dates = conn.execute("SELECT DISTINCT date FROM confirmed;").fetchall()
    dates = [date['date'] for date in dates]
    conn.close()

    return render_template('index.html', tables=tables, dates=dates)

# Route to get data for a specific table and date
@app.route('/data/<table>/<date>')
def get_table_data(table, date):
    try:
        conn = get_db_connection()
        df_data = get_data(conn, table, date)
        conn.close()

        # Convert the DataFrame to a JSON string
        data_json = json.dumps(df_data)
        return make_response(data_json, 200)
    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)

if __name__ == '__main__':
    app.run(debug=True)
