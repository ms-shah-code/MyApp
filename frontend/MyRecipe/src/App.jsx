import { useState } from 'react'
import { Route, Router, Routes, Navigate } from 'react-router-dom'
import Signup from './pages/signup'
import Login from './pages/login'
import Home from './pages/home'
import { AuthProvider } from './context/authContext'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import Upload from './pages/Upload'
import Loading from './components/Loading'

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
            <Route path='/profile' element={<Profile />} />
            {/* <Route path='/loading' element={<Loading />} /> remove */}
            <Route path='/upload' element={<ProtectedRoute><Upload /></ProtectedRoute> } />
          </Routes>
        </AuthProvider>
      </div>
    </>
  )
}

export default App
