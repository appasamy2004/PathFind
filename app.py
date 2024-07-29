from flask import Flask, jsonify, request, render_template
import random
import string

app = Flask(__name__)

def generate_random_location_name(length=2):
    return ''.join(random.choices(string.ascii_uppercase, k=length))

def generate_locations(num_locations):
    locations = {}
    for _ in range(num_locations):
        name = generate_random_location_name()
        x = random.randint(0, 750)  # X-coordinate for map width (800px - 50px)
        y = random.randint(0, 550)  # Y-coordinate for map height (600px - 50px)
        locations[name] = {'x': x, 'y': y}
    return locations

def generate_paths(locations):
    paths = {}
    location_names = list(locations.keys())
    num_locations = len(location_names)

    # Create a minimal number of edges with multiple paths
    for i, start in enumerate(location_names):
        paths[start] = {}
        # Ensure each node has edges to a few other nodes
        connections = random.sample(location_names, min(4, num_locations - 1))  # 4 random connections per node, adjust if needed
        for end in connections:
            if start != end:
                # Ensure unique costs
                cost = random.randint(1, 10)
                if end not in paths[start]:
                    paths[start][end] = cost
                    # For undirected graph, also add the reverse path
                    if start not in paths.get(end, {}):
                        paths.setdefault(end, {})[start] = cost
    return paths

# Generate data
locations = generate_locations(20)  # Adjust number of locations as needed
paths = generate_paths(locations)

def dijkstra(start, end):
    import heapq
    queue, seen = [(0, start, [])], set()
    while queue:
        (cost, node, path) = heapq.heappop(queue)
        if node in seen: continue
        path = path + [node]
        seen.add(node)
        if node == end: return (cost, path)
        for (next_node, weight) in paths[node].items():
            if next_node not in seen:
                heapq.heappush(queue, (cost + weight, next_node, path))
    return float("inf"), []

@app.route('/')
def index():
    return render_template('index.html', locations=locations, paths=paths)

@app.route('/shortest-path', methods=['POST'])
def shortest_path():
    data = request.json
    start = data['start']
    end = data['end']
    cost, path = dijkstra(start, end)
    return jsonify({'cost': cost, 'path': path})

if __name__ == '__main__':
    app.run(debug=True)
