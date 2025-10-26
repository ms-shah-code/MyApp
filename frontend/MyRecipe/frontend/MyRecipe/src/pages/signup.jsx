import React from 'react'
import { useState } from 'react'
import {ToastContainer} from "react-toastify"

const signup = () => {
    const [signupInfo, setSignupInfo] = useState({

    })
  return (
    <div className='container'>
        <h1>Sign up</h1>
        <form>
            <div className='avatar'>
                <div className="profile" style={{width:'100px',height:'100px',border:'2px solid gray',overflow:'visible',borderRadius:'50%'}}>
                    <img src="./public/wallpaper.jpg" alt="" style={{objectFit:'contain'}}/>
                </div>
                <label htmlFor='avatarFile'>Avatar</label>
                <input type="file" accept='image/*' id='avatarFile' style={{display:"none"}} onChange={()=>{}}/>

            </div>
        </form>
      <ToastContainer/>
    </div>
  )
}

export default signup
