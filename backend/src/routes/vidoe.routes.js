import {Router} from "express"
import { upload } from "../middleware/multer.middleware.js"
import { 
    getAllVideos
 } from "../controllers/video.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

router.route("/").get(verifyJWT,getAllVideos)

export default router