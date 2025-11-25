import math
import requests
from flask import Flask, request, jsonify
from itertools import permutations

app = Flask(__name__)

route_cache = {}

def haversine_distance(coord1, coord2):
    R = 6371
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) * math.sin(dlat / 2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dlon / 2) * math.sin(dlon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    d = R * c
    return d

def get_osrm_route(coord1, coord2):
    cache_key = (tuple(coord1), tuple(coord2))
    if cache_key in route_cache:
        return route_cache[cache_key]

    start = f"{coord1[1]},{coord1[0]}"
    end = f"{coord2[1]},{coord2[0]}"
    url = f"http://router.project-osrm.org/route/v1/driving/{start};{end}?overview=full&geometries=geojson"
    
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data['code'] == 'Ok' and len(data['routes']) > 0:
                route = data['routes'][0]
                distance_km = route['distance'] / 1000
                duration_min = route['duration'] / 60
                geometry = [[p[1], p[0]] for p in route['geometry']['coordinates']]
                
                result = (distance_km, duration_min, geometry)
                route_cache[cache_key] = result
                return result
    except Exception as e:
        print(f"OSRM Error: {e}")
    
    dist = haversine_distance(coord1, coord2)
    duration_min = (dist / 40) * 60 
    return dist, duration_min, [coord1, coord2]

def calculate_co2_emission(distance_km, duration_hours):
    return (distance_km * 0.232) + (duration_hours * 0.5)

def calculate_route_metrics(route_coords, use_osrm=False):
    total_dist = 0
    total_duration_min = 0
    full_geometry = []
    
    if use_osrm:
        full_geometry.append(route_coords[0])
        for i in range(len(route_coords) - 1):
            dist, duration, segment_geom = get_osrm_route(route_coords[i], route_coords[i+1])
            total_dist += dist
            total_duration_min += duration
            full_geometry.extend(segment_geom[1:] if i > 0 else segment_geom)
    else:
        full_geometry = route_coords
        for i in range(len(route_coords) - 1):
            dist = haversine_distance(route_coords[i], route_coords[i+1])
            total_dist += dist
            total_duration_min += (dist / 40) * 60

    duration_hours = total_duration_min / 60
    total_carbon = calculate_co2_emission(total_dist, duration_hours)
    
    return total_dist, total_duration_min, total_carbon, full_geometry

def solve_tsp_bruteforce(origin, destination, stops):
    best_order = None
    min_cost = float('inf')
    
    for perm in permutations(stops):
        current_path_coords = [origin['coords']] + [s['coords'] for s in perm] + [destination['coords']]
        
        current_dist, current_duration, _, _ = calculate_route_metrics(current_path_coords, use_osrm=True)
        
        if current_duration < min_cost:
            min_cost = current_duration
            best_order = perm

    optimized_path = [origin] + list(best_order) + [destination]
    return optimized_path

def geocode_address(address):
    if not address:
        return None
        
    try:
        headers = {'User-Agent': 'EcoRouteCapstone/1.0'}
        url = f"https://nominatim.openstreetmap.org/search?q={address}&format=json&limit=1"
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data:
                return [float(data[0]['lat']), float(data[0]['lon'])]
    except Exception as e:
        print(f"Geocoding Error for '{address}': {e}")
    
    return None

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "eco-route-optimizer"}), 200

@app.route('/optimize', methods=['POST'])
@app.route('/api/v1/routes/optimize', methods=['POST'])
def optimize_route():
    global route_cache
    route_cache = {}
    
    data = request.get_json()
    try:
        origin = data.get('origin')
        destination = data.get('destination')
        stops = data.get('stops', [])
        
        if isinstance(origin, str): origin = {"address": origin}
        if isinstance(destination, str): destination = {"address": destination}
        stops = [{"address": s} if isinstance(s, str) else s for s in stops]
        
        if 'coords' not in origin:
            coords = geocode_address(origin.get('address'))
            origin['coords'] = coords if coords else [35.6895, 139.6917]

        if 'coords' not in destination:
            coords = geocode_address(destination.get('address'))
            destination['coords'] = coords if coords else [34.6937, 135.5023]
        
        for i, stop in enumerate(stops):
            if 'coords' not in stop:
                coords = geocode_address(stop.get('address'))
                stops[i]['coords'] = coords if coords else [35.0 + (i*0.1), 137.0 + (i*0.5)]

        original_path = [origin] + stops + [destination]
        original_coords = [p['coords'] for p in original_path]
        orig_dist, orig_duration, orig_carbon, orig_geom = calculate_route_metrics(original_coords, use_osrm=True)

        optimized_path = solve_tsp_bruteforce(origin, destination, stops)
        opt_coords = [p['coords'] for p in optimized_path]
        opt_dist, opt_duration, opt_carbon, opt_geom = calculate_route_metrics(opt_coords, use_osrm=True)

        ideal_duration_min = (opt_dist / 80) * 60
        traffic_delay_factor = opt_duration / ideal_duration_min if ideal_duration_min > 0 else 1.0
        if traffic_delay_factor < 1.0: traffic_delay_factor = 1.0

        return jsonify({
            "original": { 
                "distance_km": round(orig_dist, 2), 
                "duration_min": round(orig_duration, 2),
                "carbon_kg": round(orig_carbon, 2),
                "coordinates": orig_geom,
                "waypoints": original_coords
            },
            "optimized": { 
                "distance_km": round(opt_dist, 2), 
                "actual_road_distance_km": round(opt_dist, 2),
                "driving_time_minutes": round(opt_duration, 2),
                "traffic_delay_factor": round(traffic_delay_factor, 2),
                "carbon_kg": round(opt_carbon, 2),
                "coordinates": opt_geom,
                "waypoints": opt_coords
            },
            "savings": {
                "distance_percent": round(((orig_dist - opt_dist) / orig_dist) * 100, 1) if orig_dist > 0 else 0,
                "carbon_percent": round(((orig_carbon - opt_carbon) / orig_carbon) * 100, 1) if orig_carbon > 0 else 0,
                "time_percent": round(((orig_duration - opt_duration) / orig_duration) * 100, 1) if orig_duration > 0 else 0
            }
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
