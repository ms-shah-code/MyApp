import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Loading from "./Loading";
import Navbar from "./navbar";
import { FaEdit, FaUserCircle } from "react-icons/fa";
import "../styles/channelProfile.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import { motion } from "framer-motion";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { handleSuccess, handleError } from "../utility";
import { ToastContainer } from "react-toastify";

const ChannelProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { uname } = useParams();
  const buttonRef = useRef(null);
  const avatarRef = useRef(null);
  const coverRef = useRef(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [subscribed, setSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [showControls, setShowControls] = useState(false);
  const [showCoverControls, setShowCoverControls] = useState(false)
  const [signupInfo, setSignupInfo] = useState({
    avatar: ''
  })
  const [coverInfo, setCoverInfo] = useState({
    coverImage: ''
  })

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

  const handleAvatarUpdate = () => {
    avatarRef.current.click()
  }

  const handleCoverUpdate = () => {
    coverRef.current.click()
  }

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview ke liye optional
    setSignupInfo({ avatar: file });

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("http://localhost:8000/api/v1/users/update-avatar", {
        method: "PATCH", // ya "POST" agar backend allow kare
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      const { success, message, error } = data;

      if (success) {
        handleSuccess(message);

        // ✅ instantly UI update ke liye:
        setUserProfile((prev) => ({
          ...prev,
          avatar: URL.createObjectURL(file),
        }));
      } else {
        handleError(error || "Something went wrong!");
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      handleError("Avatar upload failed");
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0]
    if (!file) {
      return;
    }
    setCoverInfo({ coverImage: file })
    const formData = new FormData()
    formData.append("coverImage", file)
    try {
      const res = await fetch('http://localhost:8000/api/v1/users/update-coverImage', {
        method: "PATCH",
        body: formData,
        credentials: "include"
      })
      const data = await res.json()
      const { message, success, error } = data
      if (success) {
        handleSuccess(message);

        // ✅ instantly UI update ke liye:
        setUserProfile((prev) => ({
          ...prev,
          coverImage: URL.createObjectURL(file),
        }));
      } else {
        handleError(error || "Something went wrong!");
      }
    } catch (error) {
      console.error("Avatar upload failed:", err);
      handleError("Avatar upload failed");
    }
  }

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

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);

        // ✅ Fetch user channel info
        const res = await fetch(`http://localhost:8000/api/v1/users/c/${uname}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
        const data = await res.json();
        setUserProfile(data.data);
        console.log("userProfile::", data.data)
        // ✅ Fetch channel videos (based on user id)
        const videoRes = await fetch(
          `http://localhost:8000/api/v1/videos/user/${data.data._id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (videoRes.ok) {
          const videoData = await videoRes.json();
          console.log("videoProfile::", videoData.data)
          setVideos(videoData.data || []);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [uname]);

  //isSubscribed
  useEffect(() => {
    const checkSubscription = async () => {
      if (!userProfile?._id) return;
      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/subscriptions/is-subscribed/${userProfile._id}`,
          { method: "GET", credentials: "include" }
        );
        const data = await res.json();
        setSubscribed(data.subscribed);
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };
    checkSubscription();
  }, [userProfile?._id]);


  // ✅ Toggle Subscribe/Unsubscribe
  const handleSubscribe = async () => {
    if (!userProfile?._id) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/subscriptions/c/${userProfile._id}`,
        { method: "POST", credentials: "include" }
      );
      const data = await res.json();

      if (data.success) setSubscribed(data.subscribed);
    } catch (error) {
      console.error("Error toggling subscription:", error);
    }
  };


  if (loading || !userProfile) return <Loading />;

  return (
    <div className="channel-page">
      <Navbar />

      {/* ✅ Cover Image */}
      <div className="channel-cover"
        onMouseEnter={() => setShowCoverControls(true)}
        onMouseLeave={() => setShowCoverControls(false)}
        style={{ position: "relative" }}>
        <img
          src={
            userProfile.coverImage ||
            userProfile.avatar
          }
          alt="Channel Cover"
        />
        {user && user._id === userProfile._id && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={showCoverControls ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
              position: "absolute",
              bottom: '5px',
              right: '5px',
              background: "#000000b0",
              borderRadius: "50%",
              padding: '8px',
              cursor: "pointer"
            }}
            onClick={() => handleCoverUpdate()}
          >
            <FiEdit2 size={18} color="#fff" />
            <input type="file" name="coverImage" ref={coverRef} style={{ display: "none" }} accept='image/*' id="cid" onChange={handleCoverChange} />
          </motion.div>
        )}
      </div>

      {/* ✅ Channel Info Section */}
      <div className="channel-info">
        <div className="channel-avatar"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
          style={{ position: "relative" ,height:'100px',width:'100px'}}
        >
          {userProfile.avatar ? (
            <img src={userProfile.avatar} alt="Channel Avatar" />
          ) : (
            <FaUserCircle size={100} color="#ccc" />
          )}
          {/* Animate Edit icon */}
          {user && user._id === userProfile._id && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={showControls ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{
                position: "absolute",
                bottom: '5px',
                right: '5px',
                background: "#000000b0",
                borderRadius: "50%",
                padding: '8px',
                cursor: "pointer"
              }}
              onClick={() => handleAvatarUpdate()}
            >
              <FiEdit2 size={18} color="#fff" />
              <input type="file" name="avatar" ref={avatarRef} style={{ display: "none" }} accept='image/*' id="avatarId" onChange={handleChange} />
            </motion.div>
          )}
        </div>

        <div className="channel-details">
          <h2 className="channel-name">
            {userProfile.fullname || userProfile.fullName}
          </h2>
          <p className="channel-username">@{userProfile.username}</p>
          <p className="channel-stats">
            {userProfile.subscribersCount || 0} subscribers • {videos.length} videos
          </p>
        </div>

        {
          user && user._id !== userProfile._id && (
            <button className="subscribe-btn"
              onClick={() => handleSubscribe()}
              style={{
                background: subscribed ? "#333" : "red",
                color: "white",
                border: "none",
                fontWeight: "bold",
                borderRadius: "20px",
                padding: "10px 18px",
                cursor: "pointer",
              }}
            >
              {subscribed ? "Unsubscribe" : "Subscribe"}
            </button>
          )
        }
      </div>

      <div className="channel-tabs">
        <button
          className={`tab ${activeTab === "videos" ? "active" : ""}`}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </button>
        <button
          className={`tab ${activeTab === "playlists" ? "active" : ""}`}
          onClick={() => setActiveTab("playlists")}
        >
          Playlists
        </button>
        <button
          className={`tab ${activeTab === "about" ? "active" : ""}`}
          onClick={() => setActiveTab("about")}
        >
          About
        </button>
      </div>

      {/* Tab Content */}
      {/* <div className="tab-content">
        {activeTab === "videos" && <VideosGrid videos={videos} />}
        {activeTab === "playlists" && <PlaylistsGrid playlists={playlists} />}
        {activeTab === "about" && <AboutSection userProfile={userProfile} />}
      </div> */}

      {/* ✅ Videos Grid */}
      <div className="video-grid">
        {videos && videos.length > 0 ? (
          videos.map(item => (
            <div key={item._id} style={{ background: "#0f0f0f", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "relative", cursor: 'pointer' }}>
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  style={{ height: "180px", width: "100%", objectFit: "cover", borderRadius: "10px" }}
                  onClick={() => navigate(`/watch/${item._id}`)}
                />
                <div style={{ position: "absolute", bottom: "9px", right: "4px", padding: "2px 6px", borderRadius: "4px", background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: "12px" }}>
                  {formatDuration(item.duration)}
                </div>
              </div>

              <div style={{ padding: "10px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  {/* <img src={userProfile.avatar} onClick={() => navigate(`/channel/${userProfile.username}`)} style={{ height: "45px", width: "45px", borderRadius: "50%", objectFit: "cover", cursor: 'pointer' }} /> */}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: "20px", fontWeight: "500" }}>{item.title}</p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "6px", fontSize: "13px", color: "#aaa", flexWrap: "wrap" }}>
                        {/* <span>{userProfile.username}</span>
                        <span>•</span> */}
                        <span>{item.view} views</span>
                        <span>•</span>
                        <span>{item.createdAt ? timeAgo(item.createdAt) : ""}</span>
                      </div>

                      <div>
                        <button
                          ref={buttonRef}
                          onClick={(e) => handleMenuClick(item._id, e)}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#3f3d3dff"}
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
          ))
        ) : (
          <p className="no-videos">No videos uploaded yet</p>
        )}
      </div>
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
            {item._id === user._id && (<>
              <p onClick={() => handleEdit(item._id)} style={{ cursor: "pointer", textAlign: "center", padding: "4px 18px", borderRadius: '6px', margin: '5px' }} onMouseEnter={(e) => e.currentTarget.style.background = "gray"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>edit</p>
              <p onClick={() => handleDelete(item._id)} style={{ cursor: "pointer", textAlign: "center", padding: "4px 18px", borderRadius: '6px', color: 'red', margin: '5px' }} onMouseEnter={(e) => e.currentTarget.style.background = "gray"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>delete</p>
            </>)}
          </motion.div>
        </>
        )
      })()}
      <ToastContainer />
    </div>
  );
};

export default ChannelProfile;
