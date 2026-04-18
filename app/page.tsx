'use client'
import { useState, useEffect, useRef } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { getBubbleSortSteps } from './algorithms/bubbleSort'
import { getSelectionSortSteps } from './algorithms/selectionSort'
import { getInsertionSortSteps } from './algorithms/insertionSort'
import { getMergeSortSteps } from './algorithms/mergeSort'
import { getQuickSortSteps } from './algorithms/quickSort'

function getSteps(algo, arr) {
  if (algo === 'Bubble Sort') return getBubbleSortSteps(arr)
  if (algo === 'Selection Sort') return getSelectionSortSteps(arr)
  if (algo === 'Insertion Sort') return getInsertionSortSteps(arr)
  if (algo === 'Merge Sort') return getMergeSortSteps(arr)
  if (algo === 'Quick Sort') return getQuickSortSteps(arr)
  return getBubbleSortSteps(arr)
}

const COMPLEXITY = {
  'Bubble Sort': { time: 'O(n²)', space: 'O(1)' },
  'Selection Sort': { time: 'O(n²)', space: 'O(1)' },
  'Insertion Sort': { time: 'O(n²)', space: 'O(1)' },
  'Merge Sort': { time: 'O(n log n)', space: 'O(n)' },
  'Quick Sort': { time: 'O(n log n)', space: 'O(log n)' },
}

async function getAIExplanation(algo, step, setExplanation) {
  setExplanation('🤔 Thinking...')
  try {
    const prompt = `You are a friendly DSA teacher explaining ${algo} to a beginner student.
Current step: Array is [${step.array}].
${step.done
  ? 'The array is now fully sorted!'
  : `Comparing positions ${step.comparing} with values ${step.comparing.map(i => step.array[i])}.${step.swapped ? ' A swap just happened!' : ' No swap needed.'}`
}
Explain this step in 2-3 simple sentences. Be friendly, clear, and mention WHY this step matters.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await response.json()
    setExplanation(data.content?.[0]?.text || 'Could not get explanation.')
  } catch (err) {
    setExplanation('Could not load AI explanation. Check your API key.')
  }
}

const btnStyle = {
  padding: '10px 24px',
  borderRadius: '10px',
  border: '1px solid #2a2a2a',
  backgroundColor: '#1a1a1a',
  color: '#888',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: '500',
  transition: 'all 0.2s',
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [selectedAlgo, setSelectedAlgo] = useState('Bubble Sort')
  const initialArray = [6, 3, 8, 1, 5, 2, 7, 4]
  const [steps, setSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [explanation, setExplanation] = useState('Hit Play or press Next to start!')
  const intervalRef = useRef(null)

  useEffect(() => {
    setIsPlaying(false)
    setCurrentStep(0)
    setExplanation('Hit Play or press Next to start!')
    setSteps(getSteps(selectedAlgo, initialArray))
  }, [selectedAlgo])

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 2000)
    const t2 = setTimeout(() => setShowSplash(false), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
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

  useEffect(() => {
    if (steps.length > 0 && currentStep > 0) {
      getAIExplanation(selectedAlgo, steps[currentStep], setExplanation)
    }
  }, [currentStep])

  function handleReset() {
    setIsPlaying(false)
    setCurrentStep(0)
    setExplanation('Hit Play or press Next to start!')
  }

  const current = steps[currentStep]
  const isDone = current?.done
  const complexity = COMPLEXITY[selectedAlgo]

  // Max value for normalizing bar heights
  const maxVal = Math.max(...(current?.array || [1]))

  if (showSplash) {
    return (
      <div style={{
        height: '100vh', backgroundColor: '#0a0a0a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '16px', opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}>
        <div style={{ fontSize: '5rem' }}>🧠</div>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff', letterSpacing: '-1px' }}>
          DSA Visualizer
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#444' }}>
          Learn algorithms. Watch them come alive.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '32px' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: '#6c63ff',
              animation: `bounce 0.8s ${i * 0.2}s infinite alternate`,
            }} />
          ))}
        </div>
        <style>{`
          @keyframes bounce {
            from { transform: translateY(0px); opacity: 0.3; }
            to { transform: translateY(-10px); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar selectedAlgo={selectedAlgo} onSelect={setSelectedAlgo} />

        {/* MAIN AREA */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          overflow: 'auto',
          padding: '32px 48px',
          gap: '24px',
          alignItems: 'center',
        }}>

          {/* ALGO TITLE + COMPLEXITY */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {selectedAlgo}
            </h2>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <span style={{
                backgroundColor: '#1a1a2e', color: '#6c63ff',
                padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem'
              }}>
                ⏱ Time: {complexity.time}
              </span>
              <span style={{
                backgroundColor: '#1a2e1a', color: '#22c55e',
                padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem'
              }}>
                💾 Space: {complexity.space}
              </span>
            </div>
          </div>

          {/* BARS — fixed height container, bars grow from bottom */}
          <div style={{
            width: '100%',
            maxWidth: '600px',
            height: '220px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '8px',
            borderBottom: '2px solid #1a1a1a',
            padding: '0 8px',
          }}>
            {current?.array.map((value, index) => {
              const isComparing = current?.comparing?.includes(index)
              const barColor = isDone ? '#22c55e'
                : isComparing && current?.swapped ? '#ef4444'
                : isComparing ? '#facc15'
                : '#6c63ff'
              const heightPercent = (value / maxVal) * 100

              return (
                <div key={index} style={{
                  flex: 1,
                  maxWidth: '60px',
                  height: `${heightPercent}%`,
                  backgroundColor: barColor,
                  borderRadius: '6px 6px 0 0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: '6px',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  transition: 'height 0.3s ease, background-color 0.2s ease',
                  boxShadow: isComparing ? `0 0 12px ${barColor}88` : 'none',
                }}>
                  {value}
                </div>
              )
            })}
          </div>

          {/* STATUS */}
          <div style={{
            color: isDone ? '#22c55e' : '#666',
            fontSize: '0.9rem',
            textAlign: 'center',
            minHeight: '20px'
          }}>
            {isDone ? '✅ Array sorted successfully!'
              : current?.swapped
              ? `🔄 Swapped positions ${current?.comparing?.[0]} and ${current?.comparing?.[1]}`
              : `🔍 Comparing positions ${current?.comparing?.[0]} and ${current?.comparing?.[1]}`}
          </div>

          {/* AI BOX */}
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #1e1e1e',
            borderLeft: '3px solid #6c63ff',
            borderRadius: '12px',
            padding: '16px 20px',
            maxWidth: '600px',
            width: '100%',
            color: '#bbb',
            fontSize: '0.88rem',
            lineHeight: '1.7',
            minHeight: '72px',
          }}>
            <div style={{ color: '#6c63ff', fontWeight: 'bold', marginBottom: '6px', fontSize: '0.8rem' }}>
              🤖 AI EXPLANATION
            </div>
            {explanation}
          </div>

          {/* SPEED */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#444', fontSize: '0.82rem' }}>🐢 Slow</span>
            <input type="range" min="100" max="1000" step="100"
              value={1100 - speed}
              onChange={(e) => setSpeed(1100 - Number(e.target.value))}
              style={{ width: '140px', accentColor: '#6c63ff', cursor: 'pointer' }}
            />
            <span style={{ color: '#444', fontSize: '0.82rem' }}>Fast ⚡</span>
          </div>

          {/* CONTROLS */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => setCurrentStep(p => Math.max(0, p - 1))} style={btnStyle}>
              ⬅ Prev
            </button>
            <button onClick={() => setIsPlaying(p => !p)} style={{
              ...btnStyle,
              backgroundColor: '#6c63ff',
              color: '#fff',
              border: '1px solid #6c63ff',
              padding: '10px 32px',
            }}>
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button onClick={() => setCurrentStep(p => Math.min(steps.length - 1, p + 1))} style={btnStyle}>
              Next ➡
            </button>
            <button onClick={handleReset} style={btnStyle}>
              🔄 Reset
            </button>
          </div>

          {/* LEGEND + STEP */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { color: '#6c63ff', label: 'Unsorted' },
                { color: '#facc15', label: 'Comparing' },
                { color: '#ef4444', label: 'Swapping' },
                { color: '#22c55e', label: 'Sorted' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '10px', height: '10px',
                    borderRadius: '3px', backgroundColor: item.color
                  }} />
                  <span style={{ color: '#444', fontSize: '0.78rem' }}>{item.label}</span>
                </div>
              ))}
            </div>
            <p style={{ color: '#2a2a2a', fontSize: '0.78rem' }}>
              Step {currentStep} / {steps.length - 1}
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}