import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import CommentSection from "../components/CommentSection";

const Watch = () => {
  const { videoId } = useParams();  // 👈 URL se video ID
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/api/v1/videos/${videoId}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch video: ${res.status}`);
        }

        const data = await res.json();
        console.log("data:", data.data.videoUrl);
        setVideo(data.data);
      } catch (error) {
        console.error("Error fetching video:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo(); // 👈 async function ko call karna mat bhoolna
  }, [videoId]);

  if (loading) return <p>Loading video...</p>;
  if (!video) return <p>Video not found 😢</p>;

  return (
     <div style={{ display: "flex", gap: "2rem" }}>
      <div style={{ flex: 3 }}>
        <VideoPlayer src={video.videoUrl} />
        <h2>{video.title}</h2>
        <p>{video.description}</p>

        {/* Like/Dislike/Subscribe */}
        <div style={{ display: "flex", gap: "1rem", margin: "1rem 0" }}>
          <button>👍 Like</button>
          <button>👎 Dislike</button>
        </div>

        <CommentSection videoId={videoId} />
      </div>

      <aside style={{ flex: 1 }}>
        <h3>Next Videos</h3>
        {/* map recommended videos here */}
      </aside>
    </div>
  );
};

export default Watch;
