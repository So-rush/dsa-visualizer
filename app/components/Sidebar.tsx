const algorithms = [
  { name: 'Bubble Sort',    category: 'Sorting' },
  { name: 'Selection Sort', category: 'Sorting' },
  { name: 'Insertion Sort', category: 'Sorting' },
  { name: 'Merge Sort',     category: 'Sorting' },
  { name: 'Quick Sort',     category: 'Sorting' },
  { name: 'BFS',            category: 'Graph' },
  { name: 'DFS',            category: 'Graph' },
  { name: 'Dijkstra',       category: 'Graph' },
]
export default function Sidebar({ selectedAlgo, onSelect }) {
  const categories = [...new Set(algorithms.map(a => a.category))]

  return (
    <div style={{
      width: '220px',
      backgroundColor: '#111',
      borderRight: '1px solid #222',
      padding: '16px',
      overflowY: 'auto',
    }}>
      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: '20px' }}>
          <p style={{
            fontSize: '0.7rem', color: '#555',
            textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'
          }}>
            {cat}
          </p>
          {algorithms.filter(a => a.category === cat).map((algo, i) => (
            <div key={i} onClick={() => onSelect(algo.name)} style={{
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
      ))}
    </div>
  )
}