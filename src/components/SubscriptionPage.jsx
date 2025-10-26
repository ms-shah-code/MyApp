import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/authContext';
import '../styles/Subscription.css'

const SubscriptionPage = () => {
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
    <div style={{ background: "#0f0f0f", height: "100vh", width: "100vw", padding: '0', margin: '0' }}>
      <div style={{ background: "#0f0f0f", height: "25vh", width: "100vw", padding: '0', margin: '0' ,borderBottom:'1px solid #333'}}>
        {subscriptions.length > 0 && (
          <ul className='contsub' style={{ listStyle: 'none', margin: "0", display: "flex",overflowX:'auto',overflowY:'hidden',gap:"10px"}}>

            {subscriptions.map((item) => (
              item.channel ? (
                <li key={item._id}>
                  <Link
                    to={`/channel/${item.channel.username}`}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    style={{ color: 'white', textDecoration: 'none', display: 'flex', gap: '10px', alignItems: 'center', flexDirection: "column",padding:"10px",margin:'10px',borderRadius:"10px" }}
                  >
                    <img
                      src={item.channel.avatar}
                      alt={item.channel.username}
                      style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: "cover" }}
                    />
                    <span>{item.channel.username}</span>
                  </Link>
                </li>
              ) : null
            ))}
          </ul>
        )}
      </div>
    </div>

  )
}

export default SubscriptionPage
