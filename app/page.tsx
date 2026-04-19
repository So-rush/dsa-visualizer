'use client'
import { useState, useEffect, useRef } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { getBubbleSortSteps } from './algorithms/bubbleSort'
import { getSelectionSortSteps } from './algorithms/selectionSort'
import { getInsertionSortSteps } from './algorithms/insertionSort'
import { getMergeSortSteps } from './algorithms/mergeSort'
import { getQuickSortSteps } from './algorithms/quickSort'
import ComplexityBadge from './components/ComplexityBadge'

function getSteps(algo, arr) {
  if (algo === 'Bubble Sort') return getBubbleSortSteps(arr)
  if (algo === 'Selection Sort') return getSelectionSortSteps(arr)
  if (algo === 'Insertion Sort') return getInsertionSortSteps(arr)
  if (algo === 'Merge Sort') return getMergeSortSteps(arr)
  if (algo === 'Quick Sort') return getQuickSortSteps(arr)
  return getBubbleSortSteps(arr)
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
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff' }}>
          DSA Visualizer
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#444' }}>
          Learn algorithms. Watch them come alive.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar selectedAlgo={selectedAlgo} onSelect={setSelectedAlgo} />

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

          {/* TITLE + CLEAN BADGE */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 'bold' }}>
              {selectedAlgo}
            </h2>

            <ComplexityBadge algo={selectedAlgo} />
          </div>

          {/* BARS */}
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
                  transition: 'all 0.3s ease',
                }}>
                  {value}
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}