import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import Navbar from "../components/navbar";
import { useAuth } from "../context/authContext";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import "../styles/watch.css";
import CommentBox from "../components/CommentBox";
import Video from "../components/Video";

const Watch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { videoId } = useParams();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  // ✅ Fetch video details
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/api/v1/videos/${videoId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setVideo(data.data);
      } catch (error) {
        console.error("Error fetching video:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [videoId]);

  // ✅ Fetch like info when video loads
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/likes/video-likes/${videoId}`,
          { method: "GET", credentials: "include" }
        );
        const data = await res.json();
        if (data.success) {
          setLiked(data.data.isLiked);
          setLikeCount(data.data.totalLikes);
        }
      } catch (err) {
        console.error("Error fetching like info:", err);
      }
    };
    if (videoId) fetchLikes();
  }, [videoId]);

  // ✅ Like toggle handler
  const handleLike = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/likes/toggle-like/${videoId}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (data.success) {
        setLiked(data.data.liked);
        setLikeCount(data.data.totalLikes);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  const formatDuration = (duration) => {
    const hrs = Math.floor(duration / 3600);
    const min = Math.floor((duration % 3600) / 60);
    const sec = Math.floor(duration % 60);
    return hrs > 0
      ? `${hrs.toString().padStart(2, "0")}:${min
          .toString()
          .padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
      : `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) return <p style={{ color: "white" }}>Loading video...</p>;
  if (!video) return <p style={{ color: "white" }}>Video not found</p>;

  return (
    <div className="watch-page">
      <Navbar />
      <div className="watch-container">
        <div className="video-section">
          <VideoPlayer
            src={video.videoUrl}
            duration={formatDuration(video.duration)}
          />

          <h2 className="video-title">{video.title}</h2>

          <div className="video-info-bar">
            <div className="channel-section">
              <img
                src={video.owner.avatar}
                alt="avatar"
                className="channel-avatar"
                onClick={() => navigate(`/channel/${video.owner.username}`)}
              />
              <div className="channel-meta">
                <p className="channel-name">{video.owner.username}</p>
                <p className="channel-subs" style={{ margin: "0px" }}>
                  subscribers
                </p>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className={`like-btn`}
                onClick={handleLike}
              >
                <FaThumbsUp /> <span>&nbsp;</span> {likeCount}
              </button>
              <button
                className={`dislike-btn ${disliked ? "active" : ""}`}
                onClick={handleDislike}
              >
                <FaThumbsDown />
              </button>
            </div>
          </div>

          <CommentBox videoId={video._id} />
        </div>

        <aside className="sidebar-section">
          <Video />
        </aside>
      </div>
    </div>
  );
};

export default Watch;
