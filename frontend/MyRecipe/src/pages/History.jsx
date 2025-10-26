import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Subscription.css'
import { BsThreeDotsVertical } from "react-icons/bs";
import Navbar from '../components/navbar'
import '../styles/subscription.css'

const History = () => {
    const [history, setHistory] = useState([])
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);
    const navigate = useNavigate();

    // 🔹 Fetch Watch History (runs only once)
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/users/history', {
                    method: "GET",
                    credentials: "include"
                });
                const data = await res.json();
                console.log("history:", data.data);
                setHistory(data.data || []);
            } catch (error) {
                console.error("Error fetching history:", error);
            }
        };
        fetchHistory();
    }, []);

    // 🔹 Format Time Ago
    const timeAgo = (timestamp) => {
        if (!timestamp) return "";
        const now = new Date();
        const posted = new Date(timestamp);
        const seconds = Math.floor((now - posted) / 1000);
        if (seconds < 60) return `${seconds} sec${seconds !== 1 ? "s" : ""} ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
        const years = Math.floor(days / 365);
        return `${years} year${years !== 1 ? "s" : ""} ago`;
    };

    // 🔹 Format Duration
    const formatDuration = (seconds) => {
        if (!seconds) return "00:00";
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return hrs > 0
            ? `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
            : `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // 🔹 Handle 3-dots menu click
    const handleMenuClick = (videoId, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
        setMenuOpenId(menuOpenId === videoId ? null : videoId);
    };

    return (<>
        <Navbar/>
        <div
        className='contsub'
        style={{
            minHeight: '86.1vh',
            background: "#0f0f0f",
            overflowY: 'auto',
            color: '#fff',
            padding: "1rem",
        }}
        >
            <h2>History</h2>
            {history.length > 0 ? (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
                        // gridAutoRows:"250px",
                        gap: "1rem",
                        marginTop: "1rem"
                    }}
                >
                    {history.map((item) => (
                        <div
                            key={item._id}
                            style={{
                                background: "#0f0f0f",
                                borderRadius: "10px",
                                overflow: "hidden",
                                position: "relative"
                            }}
                        >
                            <div style={{ position: "relative", cursor: 'pointer' }}>
                                <img
                                    src={item.thumbnail}
                                    alt={item.title}
                                    style={{
                                        height: "180px",
                                        width: "100%",
                                        objectFit: "cover",
                                        borderRadius: "10px"
                                    }}
                                    onClick={() => navigate(`/watch/${item._id}`)}
                                />
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: "9px",
                                        right: "4px",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        background: "rgba(0,0,0,0.7)",
                                        color: "#fff",
                                        fontSize: "12px"
                                    }}
                                >
                                    {formatDuration(item.duration)}
                                </div>
                            </div>

                            <div style={{ padding: "10px" }}>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <img
                                        src={item.owner?.avatar}
                                        onClick={() => navigate(`/channel/${item.owner?.username}`)}
                                        alt="owner avatar"
                                        style={{
                                            height: "45px",
                                            width: "45px",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <p
                                            style={{
                                                margin: 0,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                lineHeight: "20px",
                                                fontWeight: "500"
                                            }}
                                        >
                                            {item.title}
                                        </p>

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center"
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "6px",
                                                    fontSize: "13px",
                                                    color: "#aaa",
                                                    flexWrap: "wrap"
                                                }}
                                            >
                                                <span>{item.owner?.username}</span>
                                                <span>•</span>
                                                <span>{item.view} views</span>
                                                <span>•</span>
                                                <span>{item.createdAt ? timeAgo(item.createdAt) : ""}</span>
                                            </div>

                                            <button
                                                ref={buttonRef}
                                                onClick={(e) => handleMenuClick(item._id, e)}
                                                onMouseEnter={(e) => e.currentTarget.style.background = "#0c0c0c"}
                                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                                style={{
                                                    background: "transparent",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    height: "30px",
                                                    borderRadius: "50%"
                                                }}
                                            >
                                                <BsThreeDotsVertical size={20} color="white" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ textAlign: "center", marginTop: "2rem", color: "#aaa" }}>
                    No watch history yet 😔
                </p>
            )}
        </div>
   </>);
}

export default History;
