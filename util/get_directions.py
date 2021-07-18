# get directions from mapbox directions API

import json, requests


token = 'pk.eyJ1IjoibmlyeWFyaXYiLCJhIjoiQjdJeWdqZyJ9.pZOwn6stABGoptmp0DH1wg'
alts = 'false'
steps = 'false'

f = open ('../data/negev.geojson',)

data = json.load(f)
coords = ''
for loc in data['features']:
    lat = loc['geometry']['coordinates'][0]
    lon = loc['geometry']['coordinates'][1]

    coords += f"{lat},{lon};"

coords = coords[:-1]

url = f'https://api.mapbox.com/directions/v5/mapbox/driving/{coords}?alternatives={alts}&geometries=geojson&steps={steps}&access_token={token}' 

print(url)

resp = requests.get(url).json()
route = resp['routes'][0]['geometry']

print(route)

