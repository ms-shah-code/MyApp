import React from 'react'
import { useState } from 'react'
import { ToastContainer } from "react-toastify"
import "../signup.css"
import { Link, useNavigate } from 'react-router-dom'
import { handleSuccess, handleUpdate, handleError } from '../utility'

const signup = () => {
  const [signupInfo, setSignupInfo] = useState({
    email: '',
    username: '',
    fullname: '',
    password: '',
    avatar: ''
  })
  const [avatarUrl, setAvatarUrl] = useState(null)

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      const avatar = URL.createObjectURL(files[0])
      setAvatarUrl(avatar)
      setSignupInfo({ ...signupInfo, [name]: files[0] })
    } else {
      setSignupInfo({ ...signupInfo, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { username, fullname, password, email } = signupInfo
    if (
      [username, fullname, password, email].some(item => item?.trim() === "")
    ) {
      handleError('some filed are missing')
    }
    if (!avatarUrl) {
      handleError('avatar are missing')
    }
    const formData = new FormData()
    formData.append("username", signupInfo.username)
    formData.append("fullname", signupInfo.fullname)
    formData.append("email", signupInfo.email)
    formData.append("password", signupInfo.password)
    formData.append("avatar", signupInfo.avatar)
    try {
      const res = await fetch("http://localhost:8000/api/v1/users/register", {
        method: "POST",
        body: formData,
        credentials:'include',
      })
      const data = await res.json()
      console.log(data)
      const { success, message, createdUser, error } = data
      if (success) {
        handleSuccess(message)
        setTimeout(() => {
          navigate('/login')
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
    <h1>Sign up</h1>
    <form onSubmit={handleSubmit}>
      <div className="main">
        <div className='avatar'>
          <div className="profile" >
            <img src={avatarUrl} alt="" style={{ width: '100px', height: '100px', border: '2px solid gray', borderRadius: '50%' }} />
          </div>
        </div>
        <div className="btn">
          <label htmlFor='avatarFile' className='label'>Avatar</label>
          <input type="file" name='avatar' accept='image/*' id='avatarFile' style={{ display: "none" }} onChange={handleChange} />
        </div>
        <div className="">
          <input
            type="email"
            name="email"
            value={signupInfo.email}
            onChange={handleChange}
            placeholder='Enter your email'
          />
        </div>
        <div className="">
          <input type="text"
            name="fullname"
            value={signupInfo.fullname}
            onChange={handleChange}
            placeholder='Fullname'
          />
        </div>
        <div>
          <input type="text"
            name="username"
            value={signupInfo.username}
            placeholder='Username'
            onChange={handleChange}
          />
        </div>
        <div>
          <input type="password"
            name="password"
            value={signupInfo.password}
            placeholder='Password'
            onChange={handleChange}
          />
        </div>
        <button type='submit' className='sbtn'>Signup</button>
        <span>Already have an account ?
          <Link to='/login'>Login</Link>
        </span>
      </div>
    </form>
    <ToastContainer />
  </div>
    </div >
  )
}

export default signup
