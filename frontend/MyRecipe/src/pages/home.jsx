import React, { useState, useEffect } from 'react'
import Navbar from '../components/navbar'
import { useAuth } from '../context/authContext'
import InfiniteScroll from 'react-infinite-scroll-component'

const home = () => {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
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
    
    <div style={{ padding: "1rem" }}>
      <h2>🎬 Latest Videos</h2>
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
                background: "#fff",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0px 3px 8px rgba(0,0,0,0.1)"

              }}
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
                        height: '40px',
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
                    >Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus pariatur, consequatur aspernatur earum tenetur enim cupiditate suscipit eligendi doloremque. Consectetur soluta quos harum enim eaque nihil accusamus modi! Dicta, tempore vel sequi iure hic nam cumque. Modi, tenetur ex deserunt quasi amet nisi voluptatibus obcaecati.</p>
                    <p style={{margin:"0"}}>{item.owner?.username} <span style={{ fontSize: "23px" }}>.</span> {item.view} views</p>
                  </div>
                </div>
              </div>

            </div>
          ))
        ) : (
          <p>No Videos Are Found</p>
        )}
      </div>
    </div>

  )
}

export default home
