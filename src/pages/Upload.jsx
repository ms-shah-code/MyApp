import React, { useState, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { MdUpload } from "react-icons/md";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { handleSuccess, handleError } from "../utility";
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";

const Upload = () => {
  const navigate = useNavigate();
  const [uploadVideo, setUploadVideo] = useState({
    title: "",
    description: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  // 📦 Handle text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUploadVideo((prev) => ({ ...prev, [name]: value }));
  };

  // 🎥 Handle video file selection
  const handleVideo = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      console.log("🎬 Video selected:", file.name);
    } else {
      handleError("Please select a valid video file!");
    }
  };

  // 🖼️ Handle thumbnail file selection
  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setThumbnail(file);
      console.log("🖼️ Thumbnail selected:", file.name);
    } else {
      handleError("Please select a valid image!");
    }
  };

  // ♻️ Reset file
  const resetFile = () => {
    setVideoFile(null);
  };

  // 📁 Open file input on div click
  const handleClick = () => {
    fileInputRef.current.click();
  };

  // 🚀 Handle Upload Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      handleError("Please select a video first!");
      return;
    }

    const formData = new FormData();
    formData.append("videoUrl", videoFile);
    if (thumbnail) formData.append("thumbnail", thumbnail);
    formData.append("title", uploadVideo.title);
    formData.append("description", uploadVideo.description);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/videos/up",
        formData,
        {
          withCredentials: true,
          onUploadProgress: (event) => {
            const percent = Math.round((event.loaded * 100) / event.total)
            setProgress(percent);
          },
        }
      );

      handleSuccess("Upload successful!");
      console.log("Response:", res.data);
      setProgress(0);
      setUploadVideo({ title: "", description: "" });
      setVideoFile(null);
      setThumbnail(null);
    } catch (error) {
      console.error("❌ Upload failed:", error);
      handleError("Upload failed!");
    }
  };

  return (
    <div style={styles.page}>
      <button onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: "10px",
          left: '10px',
          color: 'gray',
          borderRadius: '5px',
          padding: '5px',
          border: 'none',
          background:"transparent"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}


      ><FaArrowLeft size={28} /></button>
      <div style={styles.container} onClick={!videoFile ? handleClick : null}>
        <input
          type="file"
          name="videoUrl"
          accept="video/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleVideo}
        />
        {!videoFile ? (
          <div style={styles.center}>
            <FaPlus size={50} color="#777" />
            <p>Click to Upload Video</p>
          </div>
        ) : (
          <div style={styles.previewBox}>
            <video
              controls
              style={{ width: "100%", height: "100%", borderRadius: "10px" }}
            >
              <source src={URL.createObjectURL(videoFile)} type="video/mp4" />
              Your browser does not support the video tag
            </video>
            <button style={styles.removeBtn} onClick={resetFile}>
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="title"
          placeholder="Enter Title..."
          value={uploadVideo.title}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="text"
          name="description"
          placeholder="Enter Description..."
          value={uploadVideo.description}
          onChange={handleChange}
          style={styles.input}
        />

        <label htmlFor="thumbnailFile" style={styles.thumbnailLabel}>
          Choose Thumbnail
        </label>
        <input
          type="file"
          id="thumbnailFile"
          name="thumbnail"
          accept="image/*"
          onChange={handleThumbnail}
          style={{ display: "none" }}
        />

        <button type="submit" style={styles.uploadBtn}>
          <MdUpload size={25} /> Upload
        </button>
      </form>

      {/* Upload Progress */}
      {progress > 0 && (
        <div style={{ marginTop: "10px", color: "white" }}>
          Uploading: {progress}% <progress value={progress} max={100}></progress>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#181818",
    color: "white",
  },
  container: {
    width: "400px",
    height: "225px",
    background: "#2d2d2dc9",
    border: "2px dashed #aaa",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    overflow: "hidden",
    position: "relative",
  },
  center: {
    textAlign: "center",
  },
  previewBox: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  removeBtn: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "red",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  form: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    height: "30px",
    fontSize: "16px",
    border: "2px solid #474242c9",
    borderRadius: "4px",
    width: "390px",
    color: "white",
    background: "transparent",
    margin: "10px 0px",
    padding: "5px",
  },
  thumbnailLabel: {
    margin: "10px 0px",
    display: "block",
    width: "374px",
    border: "2px solid #474242c9",
    padding: "10px",
    textAlign: "center",
    color: "gray",
    cursor: "pointer",
  },
  uploadBtn: {
    background: "green",
    color: "white",
    border: "none",
    padding: "10px",
    width: "400px",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "7px",
  },
};

export default Upload;
