import {useState,React} from 'react'
import Navbar from '../components/navbar'
import { useAuth } from '../context/authContext'

const home = () => {
      const { user } = useAuth()
      console.log('home',user)
  return (
    <div className='mainCont'>
      <Navbar/>
    </div>
  )
}

export default home
