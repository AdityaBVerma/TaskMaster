import { Task } from "../models/task.model.js"
import { ApiError } from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import { isValidObjectId } from "mongoose"

export const cacheTask = asyncHandler(async (req, _, next) => {
    const redisClient = req.app.locals.redis
    const taskId = req.params.id

    if (!taskId || !isValidObjectId(taskId)) {
        throw new ApiError(400, "Invalid Task Id")
    }

    let task = await redisClient.get(`task:${taskId}`)

    if (task) {
        task = JSON.parse(task)
    } else {
        task = await Task.findById(taskId)
            .populate("creator", "name email")
            .populate("assignedto", "name email")
            .lean()

        if (!task) {
            throw new ApiError(404, "Task not found")
        }

        await redisClient.setEx(`task:${taskId}`, 3600, JSON.stringify(task))
    }

    req.task = task
    next()
})
