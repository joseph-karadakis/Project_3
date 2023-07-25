from flask import Flask, render_template, request, jsonify
import pandas as pd
import sqlite3
import folium

app = Flask(__name__)

def generate_map(table_name, selected_date):
    conn = sqlite3.connect('database/dashboard_data.db')

    if table_name == "confirmed":
        query = f"""
            SELECT c.Country_Region, c.Lat, c.Long, c.confirmed_cases, d.deaths, r.recovery
            FROM confirmed c
            LEFT JOIN deaths d ON c.Country_Region = d.Country_Region AND c.date = d.date
            LEFT JOIN recovery r ON c.Country_Region = r.Country_Region AND c.date = r.date
            WHERE c.date = ?
        """
    else:
        query = f"SELECT Country_Region, Lat, Long, {table_name} FROM {table_name} WHERE date = ?"

    df = pd.read_sql_query(query, conn, params=[selected_date])
    conn.close()

    df.dropna(subset=['Lat', 'Long'], inplace=True)  # Drop rows with missing latitude or longitude values

    m = folium.Map(location=[30, 0], zoom_start=2)

    for _, row in df.iterrows():
        country = row['Country_Region']
        lat = row['Lat']
        long = row['Long']
        cases = row['confirmed_cases'] if 'confirmed_cases' in df.columns else 0
        deaths = row['deaths'] if 'deaths' in df.columns else 0
        recovery = row['recovery'] if 'recovery' in df.columns else 0

        popup_text = f"Country: {country}<br>Confirmed Cases: {cases}<br>Deaths: {deaths}<br>Recovery: {recovery}"
        color = '#FF0000' if table_name == 'confirmed' else '#0000FF' if table_name == 'deaths' else '#00FF00'
        folium.CircleMarker(location=[lat, long], radius=5, popup=popup_text, color=color, fill=True, fill_opacity=0.7).add_to(m)

    return m._repr_html_()


@app.route('/get_dates/<string:table_name>')
def get_dates(table_name):
    conn = sqlite3.connect('database/dashboard_data.db')
    query = f"SELECT DISTINCT date FROM {table_name}"
    dates = pd.read_sql_query(query, conn)['date'].tolist()
    conn.close()

    return jsonify(dates)

@app.route('/data/<string:table_name>/<string:selected_date>')
def get_data(table_name, selected_date):
    conn = sqlite3.connect('database/dashboard_data.db')
    query = f"SELECT Country_Region, Lat, Long, {table_name} FROM {table_name} WHERE date = ?"
    df = pd.read_sql_query(query, conn, params=[selected_date])
    conn.close()

    df.dropna(subset=['Lat', 'Long'], inplace=True)  # Drop rows with missing latitude or longitude values

    return df.to_json(orient='records')

@app.route('/', methods=['GET', 'POST'])
def index():
    conn = sqlite3.connect('database/dashboard_data.db')

    if request.method == 'POST':
        table_name = request.form['table']
        selected_date = request.form['date']
    else:
        table_name = pd.read_sql_query("SELECT name FROM sqlite_master WHERE type='table'", conn)['name'][0]
        selected_date = pd.read_sql_query(f"SELECT DISTINCT date FROM {table_name}", conn)['date'][0]

    map_html = generate_map(table_name, selected_date)

    query = "SELECT name FROM sqlite_master WHERE type='table'"
    tables = pd.read_sql_query(query, conn)['name'].tolist()

    # Get the dates available for the selected table
    query = f"SELECT DISTINCT date FROM {table_name}"
    dates = pd.read_sql_query(query, conn)['date'].tolist()

    conn.close()

    return render_template('index.html', tables=tables, dates=dates, selected_table=table_name, selected_date=selected_date, map_html=map_html)

if __name__ == '__main__':
    app.run(debug=True)
