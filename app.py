from flask import Flask, render_template, jsonify
import sqlite3
import pandas as pd
import json

app = Flask(__name__)

# Function to connect to the SQLite database
def get_db_connection():
    conn = sqlite3.connect('database/dashboard_data.db')
    conn.row_factory = sqlite3.Row
    return conn

# Function to get the data for a specific column
def get_column_data(conn, column_name='January/20'):
    query = f"SELECT `Lat`, `Long`, `{column_name}` FROM confirmed;"
    df_column = pd.read_sql_query(query, conn)
    return df_column

# Home page route
@app.route('/')
def index():
    conn = get_db_connection()
    columns = conn.execute("PRAGMA table_info(confirmed);").fetchall()
    column_names = [col['name'] for col in columns if col['name'] not in ['Lat', 'Long']]
    conn.close()

    return render_template('index.html', columns=column_names)

# Route to get data for a specific column
@app.route('/column/<column_name>')
def get_column(column_name):
    conn = get_db_connection()
    df_column = get_column_data(conn, column_name)
    conn.close()

    # Convert the DataFrame to a JSON string
    data_json = df_column.to_json(orient='records')
    data = json.loads(data_json)

    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
