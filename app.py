from flask import Flask, render_template
import sqlite3
import pandas as pd

app = Flask(__name__)

# Function to connect to the SQLite database
def get_db_connection():
    conn = sqlite3.connect('database/dashboard_data.db')
    conn.row_factory = sqlite3.Row
    return conn

# Home page route
@app.route('/')
def index():
    return render_template('index.html')

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
