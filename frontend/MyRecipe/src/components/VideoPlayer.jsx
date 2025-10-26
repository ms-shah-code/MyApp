import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCog,
  FaForward,
  FaBackward,
} from "react-icons/fa";
import "../styles/youtubePlayer.css";

const YouTubePlayer = ({ src }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [speedMenu, setSpeedMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(null); // show +10/-10 icons

  // toggle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // update progress
  const updateProgress = () => {
    const percent =
      (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(percent);
  };

  const handleSeek = (e) => {
    const newTime = (e.target.value / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
  };

  // forward/backward 10s
  const seek = (secs, type) => {
    videoRef.current.currentTime += secs;
    setShowOverlay(type);
    setTimeout(() => setShowOverlay(null), 700);
  };

  // playback speed
  const changeSpeed = (rate) => {
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setSpeedMenu(false);
  };

  // mute toggle
  const toggleMute = () => {
    const newMute = !isMuted;
    videoRef.current.muted = newMute;
    setIsMuted(newMute);
  };

  // fullscreen
  const handleFullScreen = () => {
    const player = videoRef.current.parentElement;
    if (player.requestFullscreen) player.requestFullscreen();
  };

  // auto-hide controls
  useEffect(() => {
    const timeout = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timeout);
  }, [showControls]);

  // double tap gesture
  const handleDoubleClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    if (x < width / 2) seek(-10, "backward");
    else seek(10, "forward");
  };

  return (
    <div
      className="player-container"
      onMouseMove={() => setShowControls(true)}
      onDoubleClick={handleDoubleClick}
    >
      <video
        ref={videoRef}
        src={src}
        onClick={togglePlay}
        onTimeUpdate={updateProgress}
        className="player-video"
      ></video>

      {/* Overlay animations */}
      {showOverlay === "forward" && (
        <motion.div
          className="overlay right"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <FaForward size={50} color="white" />
          <p>+10s</p>
        </motion.div>
      )}
      {showOverlay === "backward" && (
        <motion.div
          className="overlay left"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <FaBackward size={50} color="white" />
          <p>-10s</p>
        </motion.div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="controls">
          {/* Progress bar */}
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="seekbar"
          />

          <div className="bottom-controls">
            <div className="left-controls">
              <button onClick={togglePlay}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button onClick={toggleMute}>
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              <input
                type="range" 
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => {
                  setVolume(e.target.value);
                  videoRef.current.volume = e.target.value;
                }}
                className="volume-slider"
              />
            </div>

            <div className="right-controls">
              <button onClick={() => setSpeedMenu(!speedMenu)}>
                <FaCog />
              </button>
              <button onClick={handleFullScreen}>
                <FaExpand />
              </button>
            </div>
          </div>

          {/* Speed settings menu */}
          {speedMenu && (
            <div className="speed-menu">
              {[0.25, 0.5, 1, 1.25, 1.5, 2].map((rate) => (
                <div
                  key={rate}
                  onClick={() => changeSpeed(rate)}
                  className={
                    playbackRate === rate ? "speed-option active" : "speed-option"
                  }
                >
                  {rate}x
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;
