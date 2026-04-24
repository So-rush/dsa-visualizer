'use client'
import { useState, useEffect, useRef } from 'react'
import { getStackSteps } from '../algorithms/stack'

const DEFAULT_OPERATIONS = [
  { type: 'push', value: 10 },
  { type: 'push', value: 20 },
  { type: 'push', value: 30 },
  { type: 'peek' },
  { type: 'pop' },
  { type: 'push', value: 40 },
  { type: 'pop' },
  { type: 'pop' },
  { type: 'pop' },
]

export default function StackVisualizer() {
  const [steps, setSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const intervalRef = useRef(null)

  useEffect(() => {
    setSteps(getStackSteps(DEFAULT_OPERATIONS))
  }, [])

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

  const current = steps[currentStep]
  const isDone = current?.type === 'done'

  const btnStyle = {
    padding: '10px 20px', borderRadius: '8px',
    border: '1px solid #2a2a2a', backgroundColor: '#1a1a1a',
    color: '#aaa', cursor: 'pointer', fontSize: '0.85rem',
  }

  const getBoxColor = (index, stackLength) => {
    const isTop = index === stackLength - 1
    if (current?.type === 'popping' && isTop) return '#ef4444'
    if (current?.highlightTop && isTop) return '#facc15'
    if (current?.type === 'pushed' && isTop) return '#22c55e'
    return '#6c63ff'
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', backgroundColor: '#0a0a0a',
      gap: '12px', padding: '16px 32px', overflow: 'hidden',
      height: '100%',
    }}>

      {/* TITLE */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '4px' }}>
          Stack
        </h2>
        <p style={{ color: '#555', fontSize: '0.85rem' }}>
          Last In First Out (LIFO) — Push and Pop from the TOP
        </p>
      </div>

      {/* MAIN VISUAL AREA — fixed height, no overflow */}
      <div style={{
        display: 'flex', flexDirection: 'row', gap: '48px',
        alignItems: 'center', justifyContent: 'center',
        height: '280px', width: '100%',
      }}>

        {/* STACK CONTAINER — fixed height, no movement */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          
          {/* TOP label — always fixed */}
          <div style={{ color: '#6c63ff', fontSize: '0.72rem', letterSpacing: '1px' }}>
            ▼ TOP
          </div>

          {/* Fixed height box — stack grows inside, never outside */}
          <div style={{
            width: '120px',
            height: '220px',
            border: '2px solid #1e1e1e',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '4px',
            overflow: 'hidden', // ← clips everything inside
            backgroundColor: '#0d0d0d',
          }}>
            {current?.stack.length === 0 && (
              <div style={{
                color: '#2a2a2a', fontSize: '0.78rem',
                textAlign: 'center', alignSelf: 'center', marginBottom: '80px'
              }}>
                empty
              </div>
            )}
            {current?.stack.map((val, index) => (
              <div key={index} style={{
                backgroundColor: getBoxColor(index, current.stack.length),
                borderRadius: '6px',
                padding: '8px',
                textAlign: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                flexShrink: 0,
                transition: 'background-color 0.2s ease',
                boxShadow: current?.highlightTop && index === current.stack.length - 1
                  ? `0 0 12px ${getBoxColor(index, current.stack.length)}66`
                  : 'none'
              }}>
                {val}
              </div>
            ))}
          </div>
        </div>

        {/* OPERATIONS LIST — fixed height with scroll, doesn't affect layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ color: '#555', fontSize: '0.72rem', letterSpacing: '1px', marginBottom: '4px' }}>
            OPERATIONS
          </div>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '4px',
            maxHeight: '220px', overflowY: 'auto',
            scrollbarWidth: 'none', // hide scrollbar Firefox
          }}>
            <style>{`::-webkit-scrollbar { display: none; }`}</style>
            {DEFAULT_OPERATIONS.map((op, i) => (
              <div key={i} style={{
                padding: '6px 14px', borderRadius: '6px',
                backgroundColor: '#111', border: '1px solid #1e1e1e',
                color: '#aaa', fontSize: '0.82rem', whiteSpace: 'nowrap',
              }}>
                {op.type === 'push' && `push(${op.value})`}
                {op.type === 'pop' && 'pop()'}
                {op.type === 'peek' && 'peek()'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATUS */}
      <div style={{
        backgroundColor: '#111', border: '1px solid #1e1e1e',
        borderLeft: `3px solid ${isDone ? '#22c55e' : '#6c63ff'}`,
        borderRadius: '12px', padding: '10px 18px',
        maxWidth: '560px', width: '100%',
        color: '#ccc', fontSize: '0.88rem', textAlign: 'center',
      }}>
        {current?.message}
      </div>

      {/* AI BOX */}
      <div style={{
        backgroundColor: '#111', border: '1px solid #1e1e1e',
        borderLeft: '3px solid #6c63ff', borderRadius: '12px',
        padding: '10px 18px', maxWidth: '560px', width: '100%',
        color: '#555', fontSize: '0.85rem',
      }}>
        <div style={{ color: '#6c63ff', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.78rem' }}>
          🤖 AI EXPLANATION
        </div>
        🔒 AI explanations coming soon!
      </div>

      {/* SPEED */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#444', fontSize: '0.82rem' }}>🐢 Slow</span>
        <input type="range" min="200" max="1500" step="100"
          value={1700 - speed}
          onChange={e => setSpeed(1700 - Number(e.target.value))}
          style={{ width: '140px', accentColor: '#6c63ff', cursor: 'pointer' }}
        />
        <span style={{ color: '#444', fontSize: '0.82rem' }}>Fast ⚡</span>
      </div>

      {/* CONTROLS — always fixed at bottom, never moves */}
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
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { color: '#6c63ff', label: 'Element' },
          { color: '#facc15', label: 'Top / Peek' },
          { color: '#22c55e', label: 'Pushed' },
          { color: '#ef4444', label: 'Popped' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: item.color }} />
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