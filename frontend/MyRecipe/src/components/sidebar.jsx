import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AiFillHome } from 'react-icons/ai'
import { MdOutlineSubscriptions, MdVideoLibrary, MdHistory, MdUpload } from 'react-icons/md'
import { useAuth } from '../context/authContext'
import { FiLogOut } from 'react-icons/fi'
import '../styles/subscription.css'

const categories = [
    { name: 'Home', path: "/home", icon: <AiFillHome size={22} /> },
    { name: 'subscriptions', path: "/subscriptions", icon: <MdOutlineSubscriptions size={22} /> },
    { name: 'History', path: "/history", icon: <MdHistory size={22} /> },
    { name: 'Library', path: "/library", icon: <MdVideoLibrary size={22} /> },
    { name: 'Upload', path: '/upload', icon: <MdUpload size={22} /> },
    // {name:'Logout',path:'/logout',icon:<FiLogOut size={22}/>},
]

const sidebar = ({ isOpen, setIsOpen }) => {
    const { logout, user } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8000/api/v1/subscriptions/subscribed-channels/${user?._id}`,
                    { method: "GET", credentials: "include" }
                );
                const data = await res.json();
                console.log("data:", data.data.channels);

                // ✅ use channels array, not whole object
                setSubscriptions(data.data.channels || []);
            } catch (error) {
                console.error("Error fetching subscriptions:", error);
            }
        };

        if (user?._id) fetchSubscriptions();
    }, [user?._id]);

    return (
        <>
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        zIndex: "1000",
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
                    backgroundColor: '#0f0f0f',
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
                    paddingBottom: '10px',
                    borderBottom: '1px solid #333',
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
                    {user && <li><Link to={'/login'}
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
                        onClick={() => logout()}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >{<FiLogOut size={22} />}<span>Logout</span></Link></li>}

                </ul>
                <h2 style={{
                    borderTop: '1px solid #333',
                    fontSize: '20px',
                    marginTop: '8px',
                    fontWeight: 'bold',
                    marginBottom: '26px',
                    padding: '10px 0px 10px',
                    borderBottom: '1px solid #333',
                }}>Subscription</h2>
                {subscriptions.length > 0 && (
                    <ul className='contsub' style={{ listStyle: 'none', padding: "10px", border: "1px solid #333", height: "150px", overflowY: "auto", borderRadius: "6px" }}>

                        {subscriptions.map((item) => (
                            item.channel ? (
                                <li key={item._id}>
                                    <Link
                                        to={`/channel/${item.channel.username}`}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                        style={{ color: 'white', textDecoration: 'none', display: 'flex', gap: '10px', alignItems: 'center', padding: '5px', borderRadius: "6px" }}
                                    >
                                        <img
                                            src={item.channel.avatar}
                                            alt={item.channel.username}
                                            style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: "cover" }}
                                        />
                                        <span>{item.channel.username}</span>
                                    </Link>
                                </li>
                            ) : null
                        ))}
                    </ul>
                )}


            </motion.div >
        </>
    )
}

export default sidebar
