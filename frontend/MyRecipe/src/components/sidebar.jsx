import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AiFillHome } from 'react-icons/ai'
import { MdOutlineSubscriptions, MdVideoLibrary, MdHistory } from 'react-icons/md'
import { useAuth } from '../context/authContext'
import {FiLogOut} from 'react-icons/fi'

const categories = [
    { name: 'Home', path: "/home", icon: <AiFillHome size={22} /> },
    { name: 'subscriptions', path: "/subscriptions", icon: <MdOutlineSubscriptions size={22} /> },
    { name: 'History', path: "/history", icon: <MdHistory size={22} /> },
    { name: 'Library', path: "/library", icon: <MdVideoLibrary size={22} /> },
    {name:'Logout',path:'/login',icon:<FiLogOut size={22}/>}
]

const sidebar = ({ isOpen, setIsOpen }) => {
    const {logout,user} = useAuth()
    return (
        <>
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    }}
                />
            )}
            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: isOpen ? 0 : "-100%" }}
                transition={{ type: 'tween', stiffness: 90 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100vh',
                    width: '240px',
                    backgroundColor: '#181818',
                    color: 'white',
                    padding: '20px',
                    zIndex: 1000
                }}
            >
                <button
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'absolute',
                        top: "10px",
                        right: "10px",
                        fontSize: '20px',
                        color: 'white',
                        backgroundColor: "transparent",
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        borderRadius: '6px'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >x</button>
                <h2 style={{
                    fontSize: '20px',
                    marginTop: '-6px',
                    fontWeight: 'bold',
                    marginBottom: '26px',
                    padding: '0px',
                    borderBottom: '2px solid white',
                }}>Menu</h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {categories.map((item) => (
                        <li key={item.name} style={{
                            marginBottom: '15px'
                        }}><Link to={item.path}
                            style={{
                                display: "flex",
                                textDecoration: 'none',
                                color: 'white',
                                fontsize: '20px',
                                alignItems: 'center',
                                gap: '10px',
                                borderRadius: '6px',
                                padding: '8px 12px'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >{item.icon}<span>{item.name}</span></Link></li>
                    ))}
                </ul>
            </motion.div >
        </>
    )
}

export default sidebar
