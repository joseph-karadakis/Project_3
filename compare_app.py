from flask import Flask, render_template, request, jsonify
import sqlite3

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
        country = request.form['country']
        selected_table = request.form['table']
    else:
        country = 'US'
        selected_table = 'confirmed'

    # Get a list of all countries from the database
    conn = get_db_connection()
    cursor = conn.execute('SELECT DISTINCT Country_Region FROM confirmed ORDER BY Country_Region')
    countries = [row['Country_Region'] for row in cursor.fetchall()]
    conn.close()

    # Prepare data for visualization
    conn = get_db_connection()
    column_name = 'confirmed_cases' if selected_table == 'confirmed' else 'deaths' if selected_table == 'deaths' else 'recovery'
    cursor = conn.execute(f"SELECT date, {column_name} as cases FROM {selected_table} WHERE Country_Region = ? ORDER BY date", (country,))
    country_data = cursor.fetchall()
    conn.close()

    data = {
        country: [{'date': row['date'], 'cases': row['cases']} for row in country_data]
    }

    return render_template('compare_index.html', countries=countries, selected_country1=country,
                           selected_table=selected_table, data=data)

@app.route('/compare', methods=['POST'])
def compare():
    country = request.json['country']
    table = request.json['table']

    # Get data for the selected country from the selected table in the database
    conn = get_db_connection()
    column_name = 'confirmed_cases' if table == 'confirmed' else 'deaths' if table == 'deaths' else 'recovery'
    cursor = conn.execute(f'SELECT date, {column_name} FROM {table} WHERE Country_Region = ? ORDER BY date', (country,))
    country_data = cursor.fetchall()
    conn.close()

    # Prepare data for visualization
    data = {
        country: [{'date': row['date'], 'cases': row[column_name]} for row in country_data]
    }

    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
