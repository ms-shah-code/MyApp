import React, { useState, useEffect } from 'react'
import Navbar from './navbar'
import { useAuth } from '../context/authContext'
import InfiniteScroll from 'react-infinite-scroll-component'
import Watch from '../pages/Watch'
import { useNavigate } from 'react-router-dom'

const home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [videos, setVideos] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const handleVideoClick = (videoId) => {
    navigate(`/watch/${videoId}`);
  }
  const fetchVideos = async () => {
    try {
      const res = await fetch(`
        http://localhost:8000/api/v1/videos?page=${page}&limit=6`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      // ✅ Step 1: Parse JSON
      const result = await res.json()

      // ✅ Step 2: Handle ApiResponse structure
      const newVideos = result?.data || [];
      if (newVideos.length === 0) {
        setHasMore(false);
        return;
      }

      // ✅ Step 4: Update state safely
      setVideos((prev) => [...prev, ...newVideos]);
      console.log("Videos Updated:", [...videos, ...newVideos]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);
  console.log("thumbnail:", videos[0]?.owner)

  return (

    <div style={{ padding: "1rem" , background:"#202020", minHeight:"100vh",color:"#fff"}}>
      <InfiniteScroll
        dataLength={videos.length}
        next={fetchVideos}
        hasMore={hasMore}
        loader={<h3>Loading...</h3>}
        endMessage={<p>
          All Videos loaded
        </p>}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          {videos.length > 0 ? (
            videos.map((item) => (
              <div key={item._id}
                style={{
                  background: "#313030ff",
                  borderRadius: "10px",
                  overflow: "hidden",
                  boxShadow: "0px 3px 8px rgba(0,0,0,0.1)"

                }}
                onClick={() => handleVideoClick(item._id)}
              >
                <img src={item.thumbnail} alt={item.title}
                  style={{
                    height: "180px"
                    , width: "100%",
                    objectFit: "cover"
                  }}
                />
                <div style={{ padding: '10px' }}>
                  <div style={{
                    display: "flex",
                    gap: "9px",
                    alignItems: 'center'
                  }}>
                    <img src={item.owner.avatar} style={{
                      height: "45px",
                      width: "45px",
                      borderRadius: '50%'
                    }} />

                    <div style={{
                      display: 'flex',
                      flexDirection: "column",
                      gap: "1px",
                      padding: "0",
                      margin: "0"
                    }}>

                      <p
                        style={{
                          width: "auto",
                          padding: "0",
                          margin: "0",
                          overflow: 'hidden',
                          textOverflow: "ellipsis",
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: "20px"
                        }}
                      >{item.title}</p>
                      <p style={{ margin: "0",color:'gray' }}>{item.owner?.username} <span style={{ fontSize: "23px" }}>.</span> {item.view} views</p>
                    </div>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <p>No Videos Are Found</p>
          )}
        </div>
      </InfiniteScroll>
    </div>

  )
}

export default home
