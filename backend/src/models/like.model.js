import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        userId:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        videoId:{
            type:Schema.Types.ObjectId,
            ref:"Video"
        },
    },
    {
        timestamps:true
    }
)

export const Like = mongoose.model("Like",likeSchema)