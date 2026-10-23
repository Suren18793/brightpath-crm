import { useState } from 'react'
import './App.css'

export default function App() {
  const [count, setCount] = useState<number>(0)

  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1>BrightPath CRM</h1>
      <p>Infrastructure & TypeScript Baseline Ready.</p>
      <button 
        type="button" 
        onClick={() => setCount((c) => c + 1)}
        style={{ padding: '0.6rem 1.2rem', fontSize: '1rem', cursor: 'pointer', borderRadius: '6px' }}
      >
        Verified Count: {count}
      </button>
    </div>
  )
}
