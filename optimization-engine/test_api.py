import requests
import json

def test_optimize():
    url = "http://localhost:5001/optimize"
    payload = {
        "origin": "Tokyo Station, Tokyo, Japan",
        "destination": "Shinjuku Station, Tokyo, Japan",
        "stops": ["Ginza Station, Tokyo, Japan", "Shibuya Station, Tokyo, Japan"]
    }
    
    with open("result.txt", "w") as f:
        f.write(f"Sending request to {url}...\n")
        try:
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                f.write("Success!\n")
                
                opt = data.get('optimized', {})
                f.write("Optimized Metrics:\n")
                f.write(f"  Distance: {opt.get('distance_km')} km\n")
                f.write(f"  Actual Road Distance: {opt.get('actual_road_distance_km')} km\n")
                f.write(f"  Driving Time: {opt.get('driving_time_minutes')} min\n")
                f.write(f"  Traffic Delay Factor: {opt.get('traffic_delay_factor')}\n")
                f.write(f"  Carbon: {opt.get('carbon_kg')} kg\n")
                f.write(f"  Waypoints: {opt.get('waypoints')}\n")
                
                if 'driving_time_minutes' in opt and 'actual_road_distance_km' in opt and 'traffic_delay_factor' in opt:
                    f.write("\n[PASS] All required fields present.\n")
                else:
                    f.write("\n[FAIL] Missing required fields.\n")
                    
            else:
                f.write(f"Error: {response.status_code}\n")
                f.write(response.text + "\n")
        except Exception as e:
            f.write(f"Exception: {e}\n")

if __name__ == "__main__":
    test_optimize()
