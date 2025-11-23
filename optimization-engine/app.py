import math
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

def calculate_route_metrics(route_coords):
    """
    Calculates total distance and estimated carbon footprint for a specific path.
    """
    total_dist = 0
    # Average truck emission: 0.265 kg CO2 per km (Heavy Goods Vehicle)
    CARBON_FACTOR = 0.265 
    
    for i in range(len(route_coords) - 1):
        dist = haversine_distance(route_coords[i], route_coords[i+1])
        total_dist += dist
        
    total_carbon = total_dist * CARBON_FACTOR
    return total_dist, total_carbon

def solve_tsp_bruteforce(origin, destination, stops):
    """
    Solves the Traveling Salesman Problem (TSP) to find the optimal stop order.
    """
    best_order = None
    min_distance = float('inf')
    
    # Create all permutations of the intermediate stops
    for perm in permutations(stops):
        current_path_coords = [origin['coords']] + [s['coords'] for s in perm] + [destination['coords']]
        current_dist, _ = calculate_route_metrics(current_path_coords)
        
        if current_dist < min_distance:
            min_distance = current_dist
            best_order = perm

    optimized_path = [origin] + list(best_order) + [destination]
    return optimized_path, min_distance

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
        
        # MOCK GEOCODING (Assign random coords near Japan if missing)
        if 'coords' not in origin: origin['coords'] = [35.6895, 139.6917] # Tokyo
        if 'coords' not in destination: destination['coords'] = [34.6937, 135.5023] # Osaka
        
        for i, stop in enumerate(stops):
            if 'coords' not in stop:
                stops[i]['coords'] = [35.0 + (i*0.1), 137.0 + (i*0.5)]

        # Calculate Metrics
        original_path = [origin] + stops + [destination]
        original_coords = [p['coords'] for p in original_path]
        orig_dist, orig_carbon = calculate_route_metrics(original_coords)

        optimized_path, opt_dist = solve_tsp_bruteforce(origin, destination, stops)
        _, opt_carbon = calculate_route_metrics([p['coords'] for p in optimized_path])

        return jsonify({
            "original": { "distance_km": round(orig_dist, 2), "carbon_kg": round(orig_carbon, 2) },
            "optimized": { "distance_km": round(opt_dist, 2), "carbon_kg": round(opt_carbon, 2) },
            "savings": {
                "distance_percent": round(((orig_dist - opt_dist) / orig_dist) * 100, 1),
                "carbon_percent": round(((orig_carbon - opt_carbon) / orig_carbon) * 100, 1)
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 EcoRoute Optimization Engine starting on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)