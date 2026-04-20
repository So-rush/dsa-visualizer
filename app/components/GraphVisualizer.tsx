'use client'
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

// Default graph
const DEFAULT_NODES = [
  { id: 0 }, { id: 1 }, { id: 2 }, { id: 3 },
  { id: 4 }, { id: 5 }, { id: 6 },
]

const DEFAULT_EDGES = [
  { source: 0, target: 1 },
  { source: 0, target: 2 },
  { source: 1, target: 3 },
  { source: 1, target: 4 },
  { source: 2, target: 5 },
  { source: 2, target: 6 },
]

// BFS steps generator
function getBFSSteps(nodes, edges, startId = 0) {
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

// DFS steps generator
function getDFSSteps(nodes, edges, startId = 0) {
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

export default function GraphVisualizer({ algo }) {
  const svgRef = useRef(null)
  const [steps, setSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const intervalRef = useRef(null)
  const simulationRef = useRef(null)
  const nodePositions = useRef({})

  // Generate steps when algo changes
  useEffect(() => {
    setIsPlaying(false)
    setCurrentStep(0)
    const s = algo === 'BFS'
      ? getBFSSteps(DEFAULT_NODES, DEFAULT_EDGES)
      : getDFSSteps(DEFAULT_NODES, DEFAULT_EDGES)
    setSteps(s)
  }, [algo])

  // Auto play
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false)
            clearInterval(intervalRef.current)
            return prev
          }
          return prev + 1
        })
      }, speed)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isPlaying, steps, speed])

  // D3 render
  useEffect(() => {
    if (!svgRef.current || steps.length === 0) return

    const current = steps[currentStep]
    const width = 560
    const height = 340

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const nodes = DEFAULT_NODES.map(n => ({
      ...n,
      x: nodePositions.current[n.id]?.x,
      y: nodePositions.current[n.id]?.y,
    }))

    const links = DEFAULT_EDGES.map(e => ({ ...e }))

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(90))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40))

    simulationRef.current = simulation

    // Draw edges
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => {
        const e = current.exploringEdge
        if (e && ((e.source === d.source.id && e.target === d.target.id) ||
          (e.source === d.target.id && e.target === d.source.id))) {
          return '#6c63ff'
        }
        return '#2a2a2a'
      })
      .attr('stroke-width', d => {
        const e = current.exploringEdge
        if (e && ((e.source === d.source.id && e.target === d.target.id) ||
          (e.source === d.target.id && e.target === d.source.id))) {
          return 3
        }
        return 2
      })

    // Draw nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'grab')

    node.append('circle')
      .attr('r', 24)
      .attr('fill', d => {
        if (current.done) return '#22c55e'
        if (d.id === current.currentNode) return '#facc15'
        if (current.visitedNodes?.includes(d.id)) return '#6c63ff'
        return '#1a1a1a'
      })
      .attr('stroke', d => {
        if (d.id === current.currentNode) return '#facc15'
        return '#333'
      })
      .attr('stroke-width', 2)

    node.append('text')
      .text(d => d.id)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')

    // Drag behavior
    const drag = d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x; d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x; d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        nodePositions.current[d.id] = { x: d.x, y: d.y }
        d.fx = null; d.fy = null
      })

    node.call(drag)

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node.attr('transform', d => {
        nodePositions.current[d.id] = { x: d.x, y: d.y }
        return `translate(${d.x},${d.y})`
      })
    })

    return () => simulation.stop()
  }, [currentStep, steps])

  const current = steps[currentStep]
  const isDone = current?.done

  const btnStyle = {
    padding: '10px 20px', borderRadius: '8px',
    border: '1px solid #2a2a2a', backgroundColor: '#1a1a1a',
    color: '#aaa', cursor: 'pointer', fontSize: '0.85rem',
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#0a0a0a', gap: '20px', padding: '32px',
      overflow: 'auto'
    }}>

      {/* TITLE */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '8px' }}>
          {algo}
        </h2>
        <p style={{ color: '#555', fontSize: '0.85rem' }}>
          {algo === 'BFS'
            ? 'Explores level by level using a Queue'
            : 'Explores depth first using Recursion'}
        </p>
      </div>

      {/* GRAPH SVG */}
      <div style={{
        backgroundColor: '#111',
        border: '1px solid #1e1e1e',
        borderRadius: '16px',
        padding: '8px',
        width: '580px',
        height: '360px',
      }}>
        <svg ref={svgRef} width="560" height="340" />
      </div>

      {/* STATUS */}
      <div style={{ color: isDone ? '#22c55e' : '#888', fontSize: '0.9rem', minHeight: '20px' }}>
        {isDone
          ? '✅ Traversal complete! All nodes visited.'
          : current?.type === 'explore'
          ? `🔍 Exploring edge: ${current.exploringEdge?.source} → ${current.exploringEdge?.target}`
          : `⚡ Visiting node ${current?.currentNode}`}
      </div>

      {/* AI BOX — ready for when you get credits */}
      <div style={{
        backgroundColor: '#111', border: '1px solid #1e1e1e',
        borderLeft: '3px solid #6c63ff', borderRadius: '12px',
        padding: '14px 18px', maxWidth: '560px', width: '100%',
        color: '#555', fontSize: '0.88rem', lineHeight: '1.6',
      }}>
        <div style={{ color: '#6c63ff', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.8rem' }}>
          🤖 AI EXPLANATION
        </div>
        🔒 AI explanations coming soon!
      </div>

      {/* SPEED */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#444', fontSize: '0.82rem' }}>🐢 Slow</span>
        <input type="range" min="100" max="1500" step="100"
          value={1600 - speed}
          onChange={e => setSpeed(1600 - Number(e.target.value))}
          style={{ width: '140px', accentColor: '#6c63ff', cursor: 'pointer' }}
        />
        <span style={{ color: '#444', fontSize: '0.82rem' }}>Fast ⚡</span>
      </div>

      {/* CONTROLS */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => setCurrentStep(p => Math.max(0, p - 1))} style={btnStyle}>⬅ Prev</button>
        <button onClick={() => setIsPlaying(p => !p)} style={{
          ...btnStyle, backgroundColor: '#6c63ff',
          color: '#fff', border: '1px solid #6c63ff', padding: '10px 32px'
        }}>
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={() => setCurrentStep(p => Math.min(steps.length - 1, p + 1))} style={btnStyle}>Next ➡</button>
        <button onClick={() => { setIsPlaying(false); setCurrentStep(0) }} style={btnStyle}>🔄 Reset</button>
      </div>

      {/* LEGEND */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {[
          { color: '#1a1a1a', label: 'Unvisited', border: '#333' },
          { color: '#facc15', label: 'Current' },
          { color: '#6c63ff', label: 'Visited' },
          { color: '#22c55e', label: 'Done' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              backgroundColor: item.color,
              border: item.border ? `1px solid ${item.border}` : 'none'
            }} />
            <span style={{ color: '#444', fontSize: '0.78rem' }}>{item.label}</span>
          </div>
        ))}
      </div>

      <p style={{ color: '#2a2a2a', fontSize: '0.78rem' }}>
        Step {currentStep} / {steps.length - 1}
      </p>
    </div>
  )
}