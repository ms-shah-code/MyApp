import { toggleVideoLike,getVideoLikes } from "../controllers/like.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { Router } from "express"

const router = Router()

router.route("/toggle-like/:videoId").post(verifyJWT, toggleVideoLike)
router.get("/video-likes/:videoId", verifyJWT, getVideoLikes);

export default router