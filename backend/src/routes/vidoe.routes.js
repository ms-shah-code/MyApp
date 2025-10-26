import { Router } from "express"
import { upload } from "../middleware/multer.middleware.js"
import {
    deleteVideo,
    getAllVideos,
    getVidoeById,
    publishVideo,
    togglePublishStatus,
    updateVideo
} from "../controllers/video.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

router.route("/").get(verifyJWT,getAllVideos)
router.route("/up").post(verifyJWT, upload.fields([
        {
            name: "videoUrl",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        }
    ]),
        publishVideo
    )
router
    .route("/:videoId")
    .get(verifyJWT, getVidoeById)
    .delete(verifyJWT, deleteVideo)
    .patch(verifyJWT, upload.single("thumbnail"), updateVideo)

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus)
export default router