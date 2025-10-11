import { color } from 'framer-motion'
import React from 'react'
import { useState, useRef } from 'react'
import { FaPlus } from 'react-icons/fa'
import { MdUpload } from 'react-icons/md'
import { ToastContainer } from 'react-toastify'
import axios from 'axios'
import { handleSuccess, handleUpdate, handleError } from '../utility'


const Upload = () => {
    const [mode, setMode] = useState("post")
    const fileInputRef = useRef(null)
    const [videoFile, setVideoFile] = useState(null)
    // const [thumbnail, setThumbnail] = useState(null)
    // const [title, setTitle] = useState(null)
    // const [description, setDescription] = useState(null)
    const [uploadVideo, setUploadVideo] = useState({
        // VideoUrl: '',
        thumbnail: "",
        title: '',
        description: ''
    })
    const [progress, setProgress] = useState(0)
    const handleChange = (e) => {
        const { value, name } = e.target
        // let file
        // console.log(e.target.files[0])
        // if (e.target.files[0]) {
        //      file = e.target.files[0]
        // }
        // if (file && file.type.startsWith("video/")) {
        //     setUploadVideo((prev)=>({ ...prev, [name]:file }))
        //     setVideoFile(e.target.files[0])
        //     console.log('video', name,"val",value)
        // }
        // else {
        //     console.log('error video file')
        // }
        setUploadVideo({ ...uploadVideo, [name]: value })
        console.log(uploadVideo)
    }
    const handleVideo = (e) => {
        const file = e.target.files[0]
        if (file && file.type.startsWith("video/")) {
            setUploadVideo({ ...uploadVideo, videoUrl: e.target.files[0] })
            setVideoFile(e.target.files[0])
            console.log('video', file)
        }
        else {
            console.log('error video file')
        }
    }
    const handleThumbnail = (e) => {
        const file = e.target.files[0]
        if (file && file.type.startsWith("image/")) {
            setUploadVideo({ ...uploadVideo, thumbnail: e.target.files[0] })
            console.log('img', uploadVideo)
        }
        else {
            console.log('error image file')
        }
    }

    const resetFile = () => {
        setVideoFile(null)
    }

    const handleClick = () => {
        fileInputRef.current.click()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch("http://localhost:8000/api/v1/videos/up", {
        method: "POST",
        credentials: "include", // cookie set karne ke liye
        body: JSON.stringify(uploadVideo.title,uploadVideo.description,uploadVideo.thumbnail),
      });
      if (!res.ok) {
        handleError("Upload failed")
      }
        } catch (error) {
            console.error("Upload error:",error)
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.container} onClick={!videoFile ? handleClick : null}>
                <input
                    type="file"
                    name='videoUrl'
                    accept='video/*'
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleVideo}
                />
                {!videoFile && (
                    <div style={styles.center}>
                        <FaPlus size={50} color='#555' />
                        <p>Click to Upload Video</p>
                    </div>
                )}
                {videoFile && (
                    <div style={styles.previewBox}>
                        <video
                            controls
                            style={{ width: "100%", height: "100%", borderRadius: '10px' }}
                        >
                            <source src={URL.createObjectURL(videoFile)} type="video/mp4" />
                            Your browser does not support the video tag
                        </video>
                        <button style={styles.removeBtn} onClick={resetFile}>Remove</button>
                    </div>
                )}
            </div>
            <form onSubmit={handleSubmit}>
                <div className="cont" style={{
                    border: '2px solid gray',
                    display: "flex",
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: "column",
                    margin: '10px',
                    padding: "10px",
                    borderRadius: "5px",

                }}>
                    <div>
                        <input
                            type="text"
                            name="title"
                            onChange={handleChange}
                            value={uploadVideo.title}
                            placeholder='Enter the title...'
                            style={{
                                height: "25px",
                                fontSize: "16px",
                                border: "2px solid #474242c9",
                                borderRadius: "2px",
                                width: "390px",
                                color: "white",
                                background: "transparent",
                                margin: "10px 0px"
                            }}
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            name="description"
                            onChange={handleChange}
                            value={uploadVideo.description}
                            placeholder='Enter the description...'
                            style={{
                                height: "25px",
                                fontSize: "16px",
                                border: "2px solid #474242c9",
                                borderRadius: "2px",
                                width: "390px",
                                color: "white",
                                background: "transparent",
                                margin: "10px 0px"
                            }}
                        />
                    </div>
                    <div>
                        <label htmlFor="thumbnailFile"
                            style={{
                                margin: "10px 0px",
                                display: "block",
                                width: "374px",
                                border: "2px solid #474242c9",
                                padding: "10px",
                                textAlign: 'center',
                                color: 'gray',
                                cursor: "pointer"
                            }}
                        >Thumbnail</label>
                        <input
                            type="file"
                            name='thumbnail'
                            onChange={handleThumbnail}
                            style={{ display: "none" }}
                            accept='image/*'
                            id='thumbnailFile'
                        />
                    </div>
                    <button type='submit' className='sbtn' style={{ background: "green", width: '400px' }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '10px',
                                fontWeight: "bold"

                            }}
                        >
                            <MdUpload size={22} />Upload
                        </div>
                    </button>
                </div>
            </form>
                {
                    progress > 0 &&(
                        <p>Uploading: {progress}%<progress value={progress} max={100}></progress></p>
                    ) 
                }
            <ToastContainer />
        </div>
    )
}

const styles = {
    page: {
        display: "flex",
        justifyContent: "center",
        background: "#202020",
        height: "100vh",
        alignItems: "center",
        flexDirection: "column"
    },
    container: {
        width: "400px",
        height: "225px",
        background: "#2d2d2dc9",
        border: "2px dashed #aaa",
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
        position: "relative"
    },
    center: {
        textAlign: 'center',
        color: '#555'
    },
    previewBox: {
        with: "100%",
        height: "100%",
        position: 'relative'
    },
    removeBtn: {
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "red",
        color: "#fff",
        border: "none",
        padding: "5px 10px",
        borderRadius: "6px",
        cursor: 'pointer'
    },
    uploadBtn: {
        background: "green",
        color: 'white',
        border: "none",
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer'
    }
}

export default Upload
