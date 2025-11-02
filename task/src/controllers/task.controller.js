import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getIdFromEmail } from "../utils/getUserIdsFromEmail.js";
import { Task } from "../models/task.model.js";


const createTask = asyncHandler(async (req, res) => {
    const redisClient = req.app.locals.redis
    const {name , description="", deadline, assignedto = []} = req.body
    if(!name || typeof name != "string" || name.trim() === "" ){
        throw new ApiError(400, "Name is Required and Should be string");
    }
    const assignedIds = await getIdFromEmail(assignedto);
    if(!deadline || isNaN(Date.parse(deadline))){
        throw new ApiError(400, "A valid deadline (Date) is required.");
    }
    if(new Date() > new Date(deadline)){
        throw new ApiError(400, "Deadline cannot be in the past.")
    }
    let successMessage = "Task created successfully. "
    if(assignedIds.length != assignedto.length){
        successMessage+="Some missing user(s) couldn't be assigned task"
    }
    const task = await Task.create({
        name,
        description,
        deadline : new Date(deadline),
        creator: req.user._id,
        assignedto : assignedIds,
        status: "pending"
    })
    await redisClient.setEx(`task:${task._id}`, 3600, JSON.stringify(task))
    return res
        .status(201)
        .json(new ApiResponse(201, task, successMessage));
});

const updateTask = asyncHandler(async (req, res) => {
    const redisClient = req.app.locals.redis
    const {name, description = ""} = req.body;
    const id = req.params.id
    if(!name || typeof name !== "string" || name.trim() === "" ){
        throw new ApiError(400, "Name is Required and Should be string");
    }
    const updatedTask = await Task.findByIdAndUpdate(
        id,
        {
            $set : {
                name,
                description
            }
        },
        {
            new : true
        }
    ).select("name description")
    if(!updatedTask){
        throw new ApiError(403, "Couldn't Update Task")
    }
    await redisClient.del(`task:${id}`)
    return res
        .status(200)
        .json(new ApiResponse(200, updatedTask, "Task updated successfully"));
});

const toggleTask = asyncHandler(async (req, res) => {
    const redisClient = req.app.locals.redis
    const id = req.params.id
    const task = req.task
    const newStatus = task.status === "done" ? "pending" : "done"

    const updatedTask = await Task.findByIdAndUpdate(
        id,
        { $set: { status: newStatus } },
        { new: true }
    )

    await redisClient.del(`task:${id}`)
    return res
        .status(200)
        .json(new ApiResponse(200, updateTask, "Task toggled successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
    const redisClient = req.app.locals.redis
    const id = req.params.id
    const task = await Task.findById(id)
    if (!task) {
        throw new ApiError(404, "Task not found")
    }
    
    await task.deleteOne()

    await redisClient.del(`task:${id}`)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Task deleted successfully"));
});

const assignContributor = asyncHandler(async (req, res) => {
    const redisClient = req.app.locals.redis
    const {contributor = []} = req.body
    const id = req.params.id

    const contributorIds = await getIdFromEmail(contributor)

    let message = "Contributors assigned successfully"
    if (contributorIds.length !== contributor.length) {
        message += ". Some users were not found and were not assigned"
    }

    if (contributorIds.length === 0) {
        throw new ApiError(400, "No valid contributors found")
    }

    const updatedTask = await Task.findByIdAndUpdate(
        id,
        {
            $addToSet: { assignedto: { $each: contributorIds } }
        },
        { new: true }
    ).populate("assignedto", "email name")

    await redisClient.del(`task:${id}`)

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTask, message));
});

const removeContributor = asyncHandler( async(req, res) => {
    const redisClient = req.app.locals.redis
    const { contributor = [] } = req.body
    const id = req.params.id

    const contributorIds = await getIdFromEmail(contributor)

    if (contributorIds.length === 0) {
        throw new ApiError(400, "No valid contributors found to remove")
    }

    const updatedTask = await Task.findByIdAndUpdate(
        id,
        {
            $pull: { assignedto: { $in: contributorIds } }
        },
        { new: true }
    ).populate("assignedto", "email name")

    let message = "Contributors removed successfully"
    if (contributorIds.length !== contributor.length) {
        message += ". Some users were not found and couldn't be removed"
    }
await redisClient.del(`task:${id}`)

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTask, message))
})

const changeDeadline = asyncHandler(async (req, res) => {
    const redisClient = req.app.locals.redis
    const { deadline } = req.body
    const id = req.params.id


    if (!deadline || isNaN(Date.parse(deadline))) {
        throw new ApiError(400, "A valid deadline (Date) is required")
    }

    const updatedTask = await Task.findByIdAndUpdate(
        id,
        { $set: { deadline: new Date(deadline) } },
        { new: true }
    )
    if (!updatedTask) {
        throw new ApiError(404, "Task not found")
    }

    await redisClient.del(`task:${id}`)

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTask, "Task deadline updated successfully"))
})

const getTask = asyncHandler(async (req, res) => {
    const redisClient = req.app.locals.redis
    const task = req.task
    await redisClient.setEx(`task:${task._id}`, 3600, JSON.stringify(task))
    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task fetched successfully"))    
})

export {
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    assignContributor,
    removeContributor,
    changeDeadline,
    getTask
};
