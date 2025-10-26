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
                <div style={{
                    display: 'flex',
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "10px"
                }}>
                    <div>
                        <button style={{
                            height: "38px",
                            width: "38px",
                            borderRadius: '50%',
                            border: 'none',
                            fontSize: '19px',
                            fontWeight: '900',
                            background: '#202020',
                            color: 'white',
                            cursor:"pointer"
                        }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        ><AiOutlineSearch /></button>
                    </div>
                    <img src={user.avatar} alt="User" style={{
                        borderRadius: '50%',
                        height: '40px',
                        width: '40px',
                        margin: '0px',
                        cursor: 'pointer'
                    }} onClick={() => {
                        setTimeout(() => {
                            navigate('/profile')
                        }, 1000);
                    }} />
                </div>
            </nav >
            <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        </div >

    )
}

export default sidebar
