import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"

const app = express()
dotenv.config({
    path: './.env'
})

app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))
app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true,limit:"50kb"}))
app.use(cookieParser())
app.use(express.static("public"))

import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/vidoe.routes.js"

app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)

///api/recipe/users/register

export {
    app
}