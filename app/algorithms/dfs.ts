export function getDFSSteps(nodes, edges, startId = 0) {
  const steps = []
  const visited = new Set()
  const adj = {}
  nodes.forEach(n => adj[n.id] = [])
  edges.forEach(e => {
    adj[e.source].push(e.target)
    adj[e.target].push(e.source)
  })

  function dfs(node) {
    visited.add(node)
    steps.push({
      visitedNodes: [...visited],
      currentNode: node,
      type: 'visit'
    })

    for (const neighbor of adj[node]) {
      if (!visited.has(neighbor)) {
        steps.push({
          visitedNodes: [...visited],
          currentNode: node,
          exploringEdge: { source: node, target: neighbor },
          type: 'explore'
        })
        dfs(neighbor)
      }
    }
  }

  dfs(startId)
  steps.push({ visitedNodes: [...visited], currentNode: null, done: true })
  return steps
}