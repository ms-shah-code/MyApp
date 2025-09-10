import {useState,React} from 'react'
import Navbar from '../components/navbar'

const home = () => {
    const [isTrue, setIsTrue] = useState(false)
  return (
    <div className='mainCont'>
      <Navbar/>
    </div>
  )
}

export default home
