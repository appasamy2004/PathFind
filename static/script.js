document.addEventListener('DOMContentLoaded', function () {
    const locations = window.locationsData;
    const paths = window.pathsData;
    const map = document.getElementById('map');
    const panzoom = Panzoom(map, {
        maxScale: 5,
        minScale: 0.5,
    });

    map.parentElement.addEventListener('wheel', panzoom.zoomWithWheel);

    // Draw locations
    for (let loc in locations) {
        if (locations.hasOwnProperty(loc)) {
            let div = document.createElement('div');
            div.className = 'location';
            div.style.left = locations[loc].x + 'px';
            div.style.top = locations[loc].y + 'px';
            div.textContent = loc;
            map.appendChild(div);
        }
    }

    // Draw paths
    for (let start in paths) {
        if (paths.hasOwnProperty(start)) {
            for (let end in paths[start]) {
                if (paths[start].hasOwnProperty(end)) {
                    drawPath(locations[start], locations[end], paths[start][end]);
                }
            }
        }
    }

    function drawPath(start, end, cost) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("class", "path");
        svg.style.position = "absolute";
        svg.style.left = "0";
        svg.style.top = "0";
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");

        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", start.x + 15);  // Center of the location circle
        line.setAttribute("y1", start.y + 15);
        line.setAttribute("x2", end.x + 15);
        line.setAttribute("y2", end.y + 15);
        line.setAttribute("class", "path");
        line.setAttribute("stroke", "blue");

        const midX = (start.x + end.x) / 2 + 15;
        const midY = (start.y + end.y) / 2 + 15;

        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", midX);
        text.setAttribute("y", midY);
        text.setAttribute("class", "path-cost");
        text.textContent = cost;

        svg.appendChild(line);
        svg.appendChild(text);
        map.appendChild(svg);
    }
});

function findShortestPath() {
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;

    fetch('/shortest-path', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ start, end }),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('output').textContent = `Cost: ${data.cost}, Path: ${data.path.join(' -> ')}`;
        // Additional code to visualize the path on the map can be added here
    });
}
