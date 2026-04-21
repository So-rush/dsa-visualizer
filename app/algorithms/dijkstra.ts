export function getDijkstraSteps(nodes, edges, startId = 0) {
  const steps = []
  const dist = {}
  const visited = new Set()
  const prev = {}

  nodes.forEach(n => {
    dist[n.id] = Infinity
    prev[n.id] = null
  })
  dist[startId] = 0

  const adj = {}
  nodes.forEach(n => adj[n.id] = [])
  edges.forEach(e => {
    adj[e.source].push({ node: e.target, weight: e.weight })
    adj[e.target].push({ node: e.source, weight: e.weight })
  })

  while (visited.size < nodes.length) {
    // Pick unvisited node with smallest distance
    let u = null
    let minDist = Infinity
    nodes.forEach(n => {
      if (!visited.has(n.id) && dist[n.id] < minDist) {
        minDist = dist[n.id]
        u = n.id
      }
    })

    if (u === null) break
    visited.add(u)

    steps.push({
      visitedNodes: [...visited],
      currentNode: u,
      distances: { ...dist },
      exploringEdge: null,
      shortestPath: getPath(prev, u),
      type: 'visit'
    })

    for (const { node: v, weight } of adj[u]) {
      if (!visited.has(v)) {
        steps.push({
          visitedNodes: [...visited],
          currentNode: u,
          distances: { ...dist },
          exploringEdge: { source: u, target: v },
          shortestPath: getPath(prev, u),
          type: 'explore'
        })

        const newDist = dist[u] + weight
        if (newDist < dist[v]) {
          dist[v] = newDist
          prev[v] = u
          steps.push({
            visitedNodes: [...visited],
            currentNode: u,
            distances: { ...dist },
            exploringEdge: { source: u, target: v },
            shortestPath: getPath(prev, v),
            type: 'update',
            updated: v
          })
        }
      }
    }
  }

  steps.push({
    visitedNodes: [...visited],
    currentNode: null,
    distances: { ...dist },
    exploringEdge: null,
    shortestPath: null,
    done: true
  })

  return steps
}

function getPath(prev, node) {
  const path = []
  let current = node
  while (current !== null) {
    path.unshift(current)
    current = prev[current]
  }
  return path
}