import math
import requests
from flask import Flask, request, jsonify
from itertools import permutations

# Initialize Flask Application
app = Flask(__name__)

# --- 1. CORE LOGIC: The "Physics" of the Engine ---

def haversine_distance(coord1, coord2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    R = 6371  # Radius of earth in km
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
    """
    Fetch real-world driving distance and geometry from OSRM.
    Returns: (distance_km, geometry_coords)
    """
    # OSRM expects {lon},{lat}
    start = f"{coord1[1]},{coord1[0]}"
    end = f"{coord2[1]},{coord2[0]}"
    
    url = f"http://router.project-osrm.org/route/v1/driving/{start};{end}?overview=full&geometries=geojson"
    
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data['code'] == 'Ok' and len(data['routes']) > 0:
                route = data['routes'][0]
                # OSRM returns distance in meters, convert to km
                distance_km = route['distance'] / 1000
                # OSRM returns [lon, lat], we need [lat, lon] for Leaflet
                geometry = [[p[1], p[0]] for p in route['geometry']['coordinates']]
                return distance_km, geometry
    except Exception as e:
        print(f"OSRM Error: {e}")
    
    # Fallback to Haversine if OSRM fails
    return haversine_distance(coord1, coord2), [coord1, coord2]

def calculate_route_metrics(route_coords, use_osrm=False):
    """
    Calculates total distance and estimated carbon footprint for a specific path.
    If use_osrm is True, fetches detailed geometry and actual driving distance.
    """
    total_dist = 0
    full_geometry = []
    
    # Average truck emission: 0.265 kg CO2 per km (Heavy Goods Vehicle)
    CARBON_FACTOR = 0.265 
    
    if use_osrm:
        # For the final path, we want the detailed geometry
        full_geometry.append(route_coords[0])
        for i in range(len(route_coords) - 1):
            dist, segment_geom = get_osrm_route(route_coords[i], route_coords[i+1])
            total_dist += dist
            # Skip the first point of the segment as it duplicates the previous last point
            full_geometry.extend(segment_geom[1:] if i > 0 else segment_geom)
    else:
        # For optimization, use Haversine for speed
        full_geometry = route_coords
        for i in range(len(route_coords) - 1):
            dist = haversine_distance(route_coords[i], route_coords[i+1])
            total_dist += dist
        
    total_carbon = total_dist * CARBON_FACTOR
    return total_dist, total_carbon, full_geometry

def solve_tsp_bruteforce(origin, destination, stops):
    """
    Solves the Traveling Salesman Problem (TSP) to find the optimal stop order.
    Uses Haversine distance for performance during permutation search.
    """
    best_order = None
    min_distance = float('inf')
    
    # Create all permutations of the intermediate stops
    for perm in permutations(stops):
        current_path_coords = [origin['coords']] + [s['coords'] for s in perm] + [destination['coords']]
        # Use simple Haversine for optimization speed
        current_dist, _, _ = calculate_route_metrics(current_path_coords, use_osrm=False)
        
        if current_dist < min_distance:
            min_distance = current_dist
            best_order = perm

    optimized_path = [origin] + list(best_order) + [destination]
    return optimized_path

def geocode_address(address):
    """
    Geocode an address string to [lat, lon] using Nominatim API.
    """
    if not address:
        return None
        
    try:
        # Nominatim requires a User-Agent
        headers = {'User-Agent': 'EcoRouteCapstone/1.0'}
        url = f"https://nominatim.openstreetmap.org/search?q={address}&format=json&limit=1"
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data:
                # Nominatim returns lat/lon as strings
                return [float(data[0]['lat']), float(data[0]['lon'])]
    except Exception as e:
        print(f"Geocoding Error for '{address}': {e}")
    
    return None

# --- 2. API ENDPOINTS ---

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "eco-route-optimizer"}), 200

@app.route('/optimize', methods=['POST'])
def optimize_route():
    data = request.get_json()
    try:
        origin = data.get('origin')
        destination = data.get('destination')
        stops = data.get('stops', [])
        
        # Handle String Inputs (convert to dicts if necessary)
        if isinstance(origin, str): origin = {"address": origin}
        if isinstance(destination, str): destination = {"address": destination}
        stops = [{"address": s} if isinstance(s, str) else s for s in stops]
        
        # GEOCODING LOGIC
        # 1. Origin
        if 'coords' not in origin:
            coords = geocode_address(origin.get('address'))
            if coords:
                origin['coords'] = coords
            else:
                # Fallback only if geocoding fails completely
                print(f"Warning: Could not geocode origin '{origin.get('address')}'. Using default.")
                origin['coords'] = [35.6895, 139.6917] # Tokyo Fallback

        # 2. Destination
        if 'coords' not in destination:
            coords = geocode_address(destination.get('address'))
            if coords:
                destination['coords'] = coords
            else:
                print(f"Warning: Could not geocode destination '{destination.get('address')}'. Using default.")
                destination['coords'] = [34.6937, 135.5023] # Osaka Fallback
        
        # 3. Stops
        for i, stop in enumerate(stops):
            if 'coords' not in stop:
                coords = geocode_address(stop.get('address'))
                if coords:
                    stops[i]['coords'] = coords
                else:
                    # Offset slightly from Tokyo if unknown
                    stops[i]['coords'] = [35.0 + (i*0.1), 137.0 + (i*0.5)]

        # Calculate Metrics for Original Path (using OSRM for accuracy)
        original_path = [origin] + stops + [destination]
        original_coords = [p['coords'] for p in original_path]
        orig_dist, orig_carbon, orig_geom = calculate_route_metrics(original_coords, use_osrm=True)

        # Optimize Route
        optimized_path = solve_tsp_bruteforce(origin, destination, stops)
        
        # Calculate Metrics for Optimized Path (using OSRM for accuracy)
        opt_coords = [p['coords'] for p in optimized_path]
        opt_dist, opt_carbon, opt_geom = calculate_route_metrics(opt_coords, use_osrm=True)

        print(f"DEBUG: Original Dist: {orig_dist}, Optimized Dist: {opt_dist}")
        print(f"DEBUG: Original Geom Points: {len(orig_geom)}, Optimized Geom Points: {len(opt_geom)}")

        return jsonify({
            "original": { 
                "distance_km": round(orig_dist, 2), 
                "carbon_kg": round(orig_carbon, 2),
                "coordinates": orig_geom,
                "waypoints": original_coords
            },
            "optimized": { 
                "distance_km": round(opt_dist, 2), 
                "carbon_kg": round(opt_carbon, 2),
                "coordinates": opt_geom,
                "waypoints": opt_coords
            },
            "savings": {
                "distance_percent": round(((orig_dist - opt_dist) / orig_dist) * 100, 1) if orig_dist > 0 else 0,
                "carbon_percent": round(((orig_carbon - opt_carbon) / orig_carbon) * 100, 1) if orig_carbon > 0 else 0
            }
        }), 200

    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 EcoRoute Optimization Engine starting on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)