import { useState, React } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from './sidebar'
import { AiOutlineSearch } from "react-icons/ai"
import { FaBars } from 'react-icons/fa'
import '../index.css'
import { useAuth } from '../context/authContext'
import { Navigate } from 'react-router-dom'

const sidebar = () => {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate()
    return (
        <div>
            <nav
                style={{
                    display: 'flex',
                    alignItems: "center",
                    justifyContent: 'space-between',
                    padding: '10px 20px',
                    backgroundColor: '#202020',
                    color: 'white',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => setIsOpen(!isOpen)} style={{
                        fontSize: '21px',
                        color: 'white',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: "5px 6px",
                        borderRadius: '6px'
                    }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        <FaBars />
                    </button>
                    <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0' }}>MyTube</h1>
                </div>
                <form>
                    <div>
                        <input
                            type="text"
                            placeholder='Search'
                            style={{ height: "25px", width: '250px', fontSize: "19px", border: '2px solid white', padding: '4px', color: 'white', backgroundColor: 'transparent', borderRadius: '10px 0px 0px 10px', outline: 'none' }}
                        />
                        <button style={{ height: '31px', fontSize: '20px', marginTop: '0px', padding: '3px', paddingBottom: "30px", color: "white", backgroundColor: 'transparent', border: "2px solid white", borderLeft: 'none', borderRadius: '0px 10px 10px 0px', cursor: 'pointer', width: "40px" }}><AiOutlineSearch /></button>
                    </div>
                </form>
                <div>
                    <img src={user.avatar} alt="User" style={{
                        borderRadius: '50%',
                        height: '40px',
                        width:'40px',
                        margin: '0px',
                        cursor:'pointer'
                    }} onClick={()=>{
                        setTimeout(() => {
                            navigate('/profile')
                        }, 1000);
                    }}/>
                </div>
            </nav>
            <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>

    )
}

export default sidebar
