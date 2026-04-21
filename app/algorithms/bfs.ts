export function getBFSSteps(nodes, edges, startId = 0) {
  const steps = []
  const visited = new Set()
  const queue = [startId]
  const adj = {}
  nodes.forEach(n => adj[n.id] = [])
  edges.forEach(e => {
    adj[e.source].push(e.target)
    adj[e.target].push(e.source)
  })

  visited.add(startId)

  while (queue.length > 0) {
    const node = queue.shift()
    steps.push({
      visitedNodes: [...visited],
      currentNode: node,
      queue: [...queue],
      type: 'visit'
    })

    for (const neighbor of adj[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
        steps.push({
          visitedNodes: [...visited],
          currentNode: node,
          exploringEdge: { source: node, target: neighbor },
          queue: [...queue],
          type: 'explore'
        })
      }
    }
  }

  steps.push({ visitedNodes: [...visited], currentNode: null, done: true })
  return steps
}