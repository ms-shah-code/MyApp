import React from 'react'
import { useState } from 'react'
import { ToastContainer } from "react-toastify"
import "../signup.css"
import { Link, useNavigate } from 'react-router-dom'
import { handleSuccess, handleUpdate, handleError } from '../utility'
import { useAuth } from '../context/authContext'

const login = () => {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  })
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setLoginInfo({ ...loginInfo, [name]: value })
    console.log(name, value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { password, email } = loginInfo
    if (
      [password, email].some(item => item?.trim() === "")
    ) {
      handleError('some filed are missing')
    }
    const formData = new FormData()
    formData.append("email", loginInfo.email)
    formData.append("password", loginInfo.password)
    try {
      const data = await login(loginInfo.email, loginInfo.password)
      const { success, message, error } = data
      if (success) {
        handleSuccess(message)
        setTimeout(() => {
          navigate('/home')
        }, 1000);
      }
      else if (error) {
        const details = error?.details[0].message
        handleError(details)
      }
      else if (!success) {
        handleError(message)
      }

    } catch (error) {
      handleError(error)
    }
  }


  return (
    <div className="body"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: "97vh"
      }}>
      <div className='container'>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="main">
            <div className="">
              <input
                type="email"
                name="email"
                value={loginInfo.email}
                onChange={handleChange}
                placeholder='Enter your email'
              />
            </div>
            <div>
              <input type="password"
                name="password"
                value={loginInfo.password}
                placeholder='Password'
                onChange={handleChange}
              />
            </div>
            <button type='submit' className='sbtn'>Login</button>
            <span>does't have an account ?
              <Link to='/signup'>register</Link>
            </span>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  )
}

export default login
