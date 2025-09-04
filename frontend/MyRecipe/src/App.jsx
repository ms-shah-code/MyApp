import { useState } from 'react'
import Signup from './pages/signup'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Signup />
    </>
  )
}

export default App
