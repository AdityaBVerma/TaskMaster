import { ApiError } from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const verifyJWT = asyncHandler( async (req, _, next) => {
    
    try {
        const redisClient = req.app.locals.redis
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer","")
        
        if(!token) {
            throw new ApiError(401, "Unauthorized request or access token not provided")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const userId = decodedToken?._id
        if (!userId) {
            throw new ApiError(401, "Invalid access token")
        }

        const cachedUser = await redisClient.get(`user:${userId}`)
        if (cachedUser) {
            req.user = JSON.parse(cachedUser)
            return next()
        }
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(401, "Invalid acess Token")
        }
        await redisClient.setEx(`user:${userId}`, 3600, JSON.stringify(user))

        req.user = user
    
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})