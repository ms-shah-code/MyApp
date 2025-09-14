import { useState } from 'react'
import { Route, Router, Routes, Navigate } from 'react-router-dom'
import Signup from './pages/signup'
import Login from './pages/login'
import Home from './pages/home'
import { AuthProvider } from './context/authContext'
import Profile from './pages/Profile'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='App'>
        <AuthProvider>
          <Routes>
            <Route path='/' element={<Navigate to='/login' />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/home' element={<Home />} />
            <Route path='/profile' element={<Profile/>}/>
          </Routes>
        </AuthProvider>
      </div>
    </>
  )
}

export default App
