import sqlite3
from geopy.geocoders import Nominatim

# Connect to the SQLite database
db_file = 'database/dashboard_data.db'  # Replace with the path to your database file
conn = sqlite3.connect(db_file)
cursor = conn.cursor()

# List of your table names
table_names = ['confirmed', 'deaths', 'recovery']  # Replace with your three table names

# Initialize the geocoder
geolocator = Nominatim(user_agent='reverse_geocoder')

for table_name in table_names:
    # Create a new column in the table to store the country name
    cursor.execute(f'ALTER TABLE {table_name} ADD COLUMN Country_Name TEXT')

    # Fetch rows from the table containing latitude and longitude values
    cursor.execute(f'SELECT rowid, Lat, Long FROM {table_name}')
    rows = cursor.fetchall()

    # Update the rows with the country names based on latitude and longitude
    for row in rows:
        rowid, lat, lon = row
        location = geolocator.reverse((lat, lon), exactly_one=True, language='en')
        country_name = location.raw['address'].get('country')
        cursor.execute(f'UPDATE {table_name} SET Country_Name = ? WHERE rowid = ?', (country_name, rowid))

# Commit the changes and close the connection
#conn.commit()
#conn.close()
