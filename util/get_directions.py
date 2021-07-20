# get directions from mapbox directions API
# USAGE
# 
# python3 get_directions.py ../data/negev.geojson
# 
# OUTPUT:
# GeoJSON linestring of the route

import json, requests, sys


token = 'pk.eyJ1IjoibmlyeWFyaXYiLCJhIjoiY2tyYXcxbmR3NDZrbDJybngwZm04bTlyZyJ9.RXiAIEMyB7JGLpEVyRl9nQ'
alts = 'false'
steps = 'false'

poi_file = sys.argv[1]

f = open (poi_file,) 

data = json.load(f)
coords = ''
for loc in data['features']:
    lat = loc['geometry']['coordinates'][0]
    lon = loc['geometry']['coordinates'][1]

    coords += f"{lat},{lon};"

coords = coords[:-1]

url = f'https://api.mapbox.com/directions/v5/mapbox/driving/{coords}?alternatives={alts}&geometries=geojson&steps={steps}&access_token={token}' 

resp = requests.get(url).json()

route = resp['routes'][0]['geometry']
print(json.dumps(route))
