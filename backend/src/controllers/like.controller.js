import { Like } from "../models/like.model";
import { Video } from "../models/video.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const toggleVideoLike = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    const like = await Video.aggregate([
        {
            $match:{
                _id:videoId
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"totalLikes"
            }
        },
        {
            $addFields:{
                likeCount:{
                    $size:"$totalLikes"
                }
            }
        }
    ])
})
export {

}