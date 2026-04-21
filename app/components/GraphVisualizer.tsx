'use client'
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { getBFSSteps } from '../algorithms/bfs'
import { getDFSSteps } from '../algorithms/dfs'

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

export default function GraphVisualizer({ algo }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [steps, setSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const intervalRef = useRef(null)
  const nodePositions = useRef({})
  const [dimensions, setDimensions] = useState({ width: 600, height: 320 })

  // Measure container size
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width: Math.floor(width), height: Math.floor(height) })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Generate steps when algo changes
  useEffect(() => {
    setIsPlaying(false)
    setCurrentStep(0)
    nodePositions.current = {}
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
    const { width, height } = dimensions

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const nodes = DEFAULT_NODES.map(n => ({
      ...n,
      x: nodePositions.current[n.id]?.x ?? width / 2,
      y: nodePositions.current[n.id]?.y ?? height / 2,
    }))

    const links = DEFAULT_EDGES.map(e => ({ ...e }))

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(36))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))

    // Draw edges
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => {
        const e = current.exploringEdge
        if (e && (
          (e.source === d.source.id && e.target === d.target.id) ||
          (e.source === d.target.id && e.target === d.source.id)
        )) return '#6c63ff'
        return '#2a2a2a'
      })
      .attr('stroke-width', d => {
        const e = current.exploringEdge
        if (e && (
          (e.source === d.source.id && e.target === d.target.id) ||
          (e.source === d.target.id && e.target === d.source.id)
        )) return 3
        return 2
      })

    // Draw nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'grab')

    node.append('circle')
      .attr('r', 26)
      .attr('fill', d => {
        if (current.done) return '#22c55e'
        if (d.id === current.currentNode) return '#facc15'
        if (current.visitedNodes?.includes(d.id)) return '#6c63ff'
        return '#1e1e1e'
      })
      .attr('stroke', d => {
        if (d.id === current.currentNode) return '#facc15'
        if (current.visitedNodes?.includes(d.id)) return '#6c63ff'
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
      .attr('pointer-events', 'none')

    // Drag
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
      // Keep nodes within bounds
      nodes.forEach(d => {
        d.x = Math.max(30, Math.min(width - 30, d.x))
        d.y = Math.max(30, Math.min(height - 30, d.y))
        nodePositions.current[d.id] = { x: d.x, y: d.y }
      })

      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => simulation.stop()
  }, [currentStep, steps, dimensions])

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
      alignItems: 'center', backgroundColor: '#0a0a0a',
      gap: '16px', padding: '24px 32px', overflow: 'auto',
    }}>

      {/* TITLE */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '6px' }}>
          {algo}
        </h2>
        <p style={{ color: '#555', fontSize: '0.85rem' }}>
          {algo === 'BFS'
            ? 'Explores level by level using a Queue'
            : 'Explores depth first using Recursion'}
        </p>
      </div>

      {/* GRAPH — fills available space */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          maxWidth: '700px',
          flex: 1,
          maxHeight: '380px',
          backgroundColor: '#111',
          border: '1px solid #1e1e1e',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ display: 'block' }}
        />
      </div>

      {/* STATUS */}
      <div style={{ color: isDone ? '#22c55e' : '#888', fontSize: '0.9rem', minHeight: '20px' }}>
        {isDone
          ? '✅ Traversal complete! All nodes visited.'
          : current?.type === 'explore'
          ? `🔍 Exploring edge: ${current.exploringEdge?.source} → ${current.exploringEdge?.target}`
          : `⚡ Visiting node ${current?.currentNode}`}
      </div>

      {/* AI BOX */}
      <div style={{
        backgroundColor: '#111', border: '1px solid #1e1e1e',
        borderLeft: '3px solid #6c63ff', borderRadius: '12px',
        padding: '14px 18px', maxWidth: '700px', width: '100%',
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
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { color: '#1e1e1e', label: 'Unvisited', border: '#333' },
          { color: '#facc15', label: 'Current' },
          { color: '#6c63ff', label: 'Visited' },
          { color: '#22c55e', label: 'Done' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              backgroundColor: item.color,
              border: `1px solid ${item.border || item.color}`
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