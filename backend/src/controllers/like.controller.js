import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    // ✅ Check if video exists
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    // ✅ Check if user already liked the video
    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        // Unlike
        await Like.deleteOne({ _id: existingLike._id });
    } else {
        // Like
        await Like.create({ video: videoId, likedBy: userId });
    }

    // ✅ Aggregate total likes and whether user liked
    const result = await Like.aggregate([
        { $match: { video: new mongoose.Types.ObjectId(videoId) } },
        {
            $group: {
                _id: "$video",
                totalLikes: { $sum: 1 },
                likedUsers: { $addToSet: "$likedBy" },
            },
        },
        {
            $addFields: {
                isLiked: { $in: [userId, "$likedUsers"] },
            },
        },
        {
            $project: {
                _id: 0,
                totalLikes: 1,
                isLiked: 1,
            },
        },
    ]);

    const likeData = result[0] || { totalLikes: 0, isLiked: false };

    res.status(200).json(
        new ApiResponse(
            200,
            likeData,
            existingLike ? "Unliked successfully" : "Liked successfully"
        )
    );
});

const getVideoLikes = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    const result = await Like.aggregate([
        { $match: { video: new mongoose.Types.ObjectId(videoId) } },
        {
            $group: {
                _id: "$video",
                totalLikes: { $sum: 1 },
                likedUsers: { $addToSet: "$likedBy" },
            },
        },
    ]);

    const totalLikes = result.length > 0 ? result[0].totalLikes : 0;
    const likedUsers = result.length > 0 ? result[0].likedUsers : [];

    const isLiked = likedUsers.some(
        (id) => id.toString() === userId.toString()
    );

    return res
        .status(200)
        .json(new ApiResponse(200, { totalLikes, isLiked }, "Like info fetched"));
});

export {
    toggleVideoLike,
    getVideoLikes
};
