import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const filter = {}
    if (query) {
        filter.$or = [
            {
                title: {
                    $regex: query,
                    $options: "i"
                }
            },
            {
                decsription: {
                    $regex: query,
                    $options: "i"
                }
            }
        ]
    }
    if (userId) {
        filter.user = userId
    }
    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("owner", "username avatar")
    if (!videos) {
        throw new ApiError(400, "Video not found")
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Video successfully fetched"
        )
    )
})

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title && !description) {
        throw new ApiError(400, "title and descreption fileds are required")
    }
    let videoLocalPath;
    console.log('video:',req.files.videoUrl[0].path);
    videoLocalPath = req.files.videoUrl[0].path;
    let thumbnailLocalPath;
    if (req.files.thumbnail && req.files.thumbnail[0]?.path) {
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }
    if (!videoLocalPath) {
        throw new ApiError(400, "video is required")
    }
    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!video) {
        throw new ApiError(500, "something went wrong during uploading video")
    }
    console.log("FILES:", req.files, "BODY:", req.body);

    const createdVideo = await Video.create({
        videoUrl: video.url,
        description,
        title,
        thumbnail: thumbnail?.url || "",
        duration: video.duration,
        owner: req.user?._id
    })
    return res.status(201).json(
        new ApiResponse(201, createdVideo, "Video successfully uploded")
    )
})

const getVidoeById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id
    if (!videoId) {
        throw new ApiError(400, "video id not found")
    }
    const video = await Video.findById(videoId).populate("owner", "username")
    if (!video) {
        throw new ApiError(400, "video are not found")
    }
    if (!video.viewedBy.includes(userId)) {
        video.view += 1
        video.viewedBy.push(userId)
        await video.save()
    }
    res.status(200).json(new ApiResponse(201,video,"Video successfully fetched"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title,description} = req.body
    if (!title && ! description) {
        throw new ApiError(400,"title or description are empty")
    }
    let thumbnailLocalPath;
    if (req.file?.path) {
        thumbnailLocalPath = req.file?.path
    }
    const video = await Video.findById(videoId)
    const publicId = await video?.thumbnail.split('/').pop().split('.')[0];
    await deleteOnCloudinary(publicId)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    const updatedVideo = await Video.findById(
        videoId,
        {
            title,
            description,
            thumbnail:thumbnail?.url || ""
        },
        {
            new:true
        }
    )
    return res.status(200)
    .json(
        200,
        {updateVideo},
        "video updated successfully"
    )
})

const deleteVideo = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    const userId = req.user?._id
     const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400,"video not found")
    }
    if (video.owner.toString()!==userId.toString()) {
        throw new ApiError(403,"Unauthorized to delete this video")
    }
    const videoPublicId = await video.VideoUrl.split("/").pop().split(".")[0]
    const publicId = await video?.thumbnail.split('/').pop().split('.')[0];
    await deleteOnCloudinary(videoPublicId)
    await deleteOnCloudinary(publicId)
    await Video.findByIdAndDelete(videoId)
    return res.status(200).json(
        200,
        {},
        "Video successfully deleted"
    )
})

const togglePublishStatus = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    const userId = req.user?._id
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(403,"video are not found")
    }
    if (video.owner.toString()!==userId.toString()) {
        throw new ApiError(403,"Unauthorized to update this video")
    }
    video.isPublished = !video.isPublished
    video.save()
    return res.status(200).json(200,{},"Video publish status updated")
})

export {
    getAllVideos,
    publishVideo,
    getVidoeById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}