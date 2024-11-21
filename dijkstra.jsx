class PriorityQueue {
  constructor() {
    this.nodes = [];
  }

  enqueue(element, priority) {
    const node = { element, priority };
    this.nodes.push(node);
    this.sort();
  }

  dequeue() {
    return this.nodes.shift();
  }

  isEmpty() {
    return this.nodes.length === 0;
  }

  sort() {
    this.nodes.sort((a, b) => a.priority - b.priority);
  }
}

export const dijkstra = (graph, start) => {
  let distances = {};
  let previous = {};
  let nodes = new PriorityQueue();

  // Initialize the start node
  Object.keys(graph).forEach((node) => {
    if (node === start) {
      distances[node] = 0;
      nodes.enqueue(node, 0);
    } else {
      distances[node] = Infinity;
    }
    previous[node] = null;
  });

  // While there are nodes to process
  while (!nodes.isEmpty()) {
    let currentNode = nodes.dequeue().element;

    // Get neighbors of the current node
    let neighbors = graph[currentNode];

    // Loop through all neighbors of the current node
    neighbors.forEach(([neighbor, weight]) => {
      let alt = distances[currentNode] + weight;

      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = currentNode;
        nodes.enqueue(neighbor, distances[neighbor]);
      }
    });
  }

  return { distances, previous };
};

// Example graph: Adjacency list where each node has neighbors [neighbor, weight]
const graph = {
  'nano-0': [
    ['esp32-0', 2],
    ['static-0', 3],
    ['static-1', 5]
  ],
  'esp32-0': [
    ['nano-0', 2],
    ['static-0', 1],
    ['static-2', 4]
  ],
  'static-0': [
    ['nano-0', 3],
    ['esp32-0', 1],
    ['static-1', 2]
  ],
  'static-1': [
    ['nano-0', 5],
    ['static-0', 2],
    ['static-2', 3]
  ],
  'static-2': [
    ['esp32-0', 4],
    ['static-1', 3]
  ]
};

// You can test it with any start node, e.g., 'nano-0'.
const { distances, previous } = dijkstra(graph, 'nano-0');
console.log("Shortest distances:", distances);
console.log("Previous nodes:", previous);
