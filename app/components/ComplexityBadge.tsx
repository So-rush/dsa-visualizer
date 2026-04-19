const COMPLEXITY = {
  'Bubble Sort':    { time: 'O(n²)',     space: 'O(1)' },
  'Selection Sort': { time: 'O(n²)',     space: 'O(1)' },
  'Insertion Sort': { time: 'O(n²)',     space: 'O(1)' },
  'Merge Sort':     { time: 'O(n log n)', space: 'O(n)' },
  'Quick Sort':     { time: 'O(n log n)', space: 'O(log n)' },
}

export default function ComplexityBadge({ algo }) {
  const c = COMPLEXITY[algo]
  if (!c) return null

  return (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
      <span style={{
        backgroundColor: '#1a1a2e', color: '#6c63ff',
        padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem'
      }}>
        ⏱ Time: {c.time}
      </span>
      <span style={{
        backgroundColor: '#1a2e1a', color: '#22c55e',
        padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem'
      }}>
        💾 Space: {c.space}
      </span>
    </div>
  )
}