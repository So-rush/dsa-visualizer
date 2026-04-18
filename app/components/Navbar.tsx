export default function Navbar() {
  return (
    <div style={{
      backgroundColor: '#111',
      borderBottom: '1px solid #222',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <span style={{ fontSize: '1.5rem' }}>🧠</span>
      <div>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
          DSA Visualizer
        </h1>
        <p style={{ fontSize: '0.75rem', color: '#555' }}>
          Learn algorithms. Watch them come alive.
        </p>
      </div>
    </div>
  )
}