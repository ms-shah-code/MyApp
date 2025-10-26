import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/authContext";
import InfiniteScroll from "react-infinite-scroll-component";
import Loading from "./Loading";
import { useNavigate } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { motion } from "framer-motion";
import VideoSkeleton from "./VideoSkeleton";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDownload = async (videoId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/videos/download/${videoId}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to get download link");

      const downloadUrl = data.data.downloadUrl;

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = ""; // auto-download
      document.body.appendChild(a);
      a.click();
      a.remove();

    } catch (error) {
      console.error("Download failed:", error);
    }
  };


  const fetchVideos = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/videos?page=${page}&limit=8`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const result = await res.json();
      const newVideos = result?.data || [];
      if (newVideos.length === 0) {
        setHasMore(false);
        return;
      }
      setVideos(prev => [...prev, ...newVideos]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  // Three-dot menu actions
  const handleEdit = (videoId) => navigate(`/edit/${videoId}`);
  const handleDelete = (videoId) => setVideos(videos.filter(v => v._id !== videoId));
  const handleSave = (videoId) => console.log("Saved video", videoId);

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

  const formatDuration = (seconds) => {
    if (!seconds) return "00:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hrs > 0
      ? `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      : `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMenuClick = (videoId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    console.log(rect)
    setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    setMenuOpenId(menuOpenId === videoId ? null : videoId);
  };

  return (
    <div style={{ padding: "1rem", background: "#0f0f0f", minHeight: "100vh", color: "#fff" }}>
      <InfiniteScroll
        dataLength={videos.length}
        next={fetchVideos}
        hasMore={hasMore}
        loader={<VideoSkeleton />}
        endMessage={<p>All Videos loaded</p>}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1rem", marginTop: "1rem" }}>
          {videos.map(item => (
            <div key={item._id} style={{ background: "#0f0f0f", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "relative", cursor: 'pointer' }}>
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  style={{ height: "220px", width: "100%", objectFit: "cover", borderRadius: "10px" }}
                  onClick={() => navigate(`/watch/${item._id}`)}
                />
                <div style={{ position: "absolute", bottom: "9px", right: "4px", padding: "2px 6px", borderRadius: "4px", background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: "12px" }}>
                  {formatDuration(item.duration)}
                </div>
              </div>

              <div style={{ padding: "10px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <img src={item.ownerDetails.avatar} onClick={() => navigate(`/channel/${item.ownerDetails.username}`)} style={{ height: "45px", width: "45px", borderRadius: "50%", objectFit: "cover", cursor: 'pointer' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: "20px", fontWeight: "500" }}>{item.title}</p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "6px", fontSize: "13px", color: "#aaa", flexWrap: "wrap" }}>
                        <span>{item.ownerDetails?.username}</span>
                        <span>•</span>
                        <span>{item.view} views</span>
                        <span>•</span>
                        <span>{item.createdAt ? timeAgo(item.createdAt) : ""}</span>
                      </div>

                      <div>
                        <button
                          ref={buttonRef}
                          onClick={(e) => handleMenuClick(item._id, e)}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#0c0c0c"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          style={{ background: "transparent", border: "none", cursor: "pointer", height: "30px", borderRadius: "50%", }}
                        >
                          <BsThreeDotsVertical size={20} color="white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>

      {/* Dropdown Menu */}
      {menuOpenId && (() => {

        const item = videos.find(v => v._id === menuOpenId);
        return (<>
          <div
            onClick={(e) => handleMenuClick(item._id, e)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.5)'
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              background: "#000000c7",
              position: "absolute",
              top: menuPosition.top,
              left: menuPosition.left,
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.44)",
              borderRadius: "8px",
              zIndex: 1000,
              overflow: "hidden",
              padding: "0px 0px",
            }}
          >
            <p onClick={() => handleSave()} style={{ cursor: "pointer", textAlign: "center", padding: "4px 18px", borderRadius: '6px', margin: '5px' }} onMouseEnter={(e) => e.currentTarget.style.background = "gray"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>save</p>
            <p onClick={() => handleDownload(item._id)} style={{ cursor: "pointer", textAlign: "center", padding: "4px 18px", borderRadius: '6px', margin: '5px' }} onMouseEnter={(e) => e.currentTarget.style.background = "gray"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>Download</p>
            {item.ownerDetails._id === user._id && (<>
              <p onClick={() => handleEdit(item._id)} style={{ cursor: "pointer", textAlign: "center", padding: "4px 18px", borderRadius: '6px', margin: '5px' }} onMouseEnter={(e) => e.currentTarget.style.background = "gray"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>edit</p>
              <p onClick={() => handleDelete(item._id)} style={{ cursor: "pointer", textAlign: "center", padding: "4px 18px", borderRadius: '6px', color: 'red', margin: '5px' }} onMouseEnter={(e) => e.currentTarget.style.background = "gray"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>delete</p>
            </>)}
          </motion.div >
        </>
        )
      })()}
    </div >
  );
};

export default Home;
