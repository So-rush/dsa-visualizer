const algorithms = [
  { name: 'Bubble Sort' },
  { name: 'Selection Sort' },
  { name: 'Insertion Sort' },
  { name: 'Merge Sort' },
  { name: 'Quick Sort' },
]

export default function Sidebar({ selectedAlgo, onSelect }) {
  return (
    <div style={{
      width: '220px',
      backgroundColor: '#111',
      borderRight: '1px solid #222',
      padding: '16px',
    }}>
      <p style={{
        fontSize: '0.7rem', color: '#555',
        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px'
      }}>
        Algorithms
      </p>
      {algorithms.map((algo, index) => (
        <div key={index} onClick={() => onSelect(algo.name)} style={{
          padding: '10px 12px', borderRadius: '8px', marginBottom: '6px',
          cursor: 'pointer', fontSize: '0.9rem',
          backgroundColor: selectedAlgo === algo.name ? '#1a1a2e' : 'transparent',
          color: selectedAlgo === algo.name ? '#6c63ff' : '#aaa',
          borderLeft: selectedAlgo === algo.name ? '3px solid #6c63ff' : '3px solid transparent'
        }}>
          {algo.name}
        </div>
      ))}
    </div>
  )
}