import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Workspace } from "../models/workspace.model.js";
import { Task } from "../models/task.model.js";
import mongoose from "mongoose";
import { getIdFromEmail } from "../utils/getUserIdsFromEmail.js";

const createWorkspace = asyncHandler(async (req, res) => {
    const {name, description, admin = [], contributors = []} = req.body
    
    if(!name || typeof name !== "string" || name.trim() === ""){
        throw new ApiError(400, "Name is Required.");
    }
    
    const existing = await Workspace.findOne({ name: name.trim(), owner: req.user._id })
    if (existing) {
        throw new ApiError(409, "A workspace with this name already exists.")
    }
    
    const adminIds = await getIdFromEmail(admin);
    const contributorIds = await getIdFromEmail(contributors);
    let successMessage = "Workspace created successfully. "
    if(adminIds.length != admin.length || contributorIds.length != contributors.length){
        successMessage+="Some provided admin or contributor emails were not found in the database."
    }
    
    const workspace = await Workspace.create({
        name,
        description,
        owner : req.user._id,
        admin : adminIds ,
        contributors : contributorIds 
    })
    
    const populatedWorkspace = await Workspace.findById(workspace._id)
        .populate("owner", "name email")
        .populate("admin", "name email")
        .populate("contributors", "name email")
    
    
    return res
        .status(201)
        .json(new ApiResponse(201, populatedWorkspace, successMessage));
});

const updateWorkspace = asyncHandler(async (req, res) => {
    //name and desc
    const redisClient = req.app.locals.redis;
    const {name , description = ""} = req.body;
    if(!name || typeof name !== "string" || name.trim() === ""){
        throw new ApiError(400, "Name is Required.");
    }
    const updatedWorkSpace = await Workspace.findByIdAndUpdate(
        req.workspace._id,
        {
            $set:{
                name,
                description
            }
        }, 
        {
            new : true
        }
    ).select("name description")
    if(!updatedWorkSpace){
        throw new ApiError(400 , "Couldn't update the workspace");
    }
    await redisClient.del(`workspace:${req.workspace._id}`)
    return res
        .status(200)
        .json(new ApiResponse(200, updatedWorkSpace, "Workspace updated successfully"));
});

const assignAdmin = asyncHandler(async (req, res) => {
    const redisClient = req.app.locals.redis;
    const {admin} = req.body
    if (!admin || !Array.isArray(admin) || admin.length === 0) {
        throw new ApiError(400, "Please provide at least one admin email.")
    }
    const adminIds = await getIdFromEmail(admin)
    let successMessage ="Admin(s) assigned successfully"
    if(adminIds.length != admin.length){
        successMessage+="Some provided admin emails were not found in the database."
    }

    const updatedWorkSpace = await Workspace.findByIdAndUpdate(
        req.workspace._id,
        { $addToSet: { admin: { $each: adminIds } } },
        { new: true }
    ).select("name owner admin")

    if(!updatedWorkSpace){
        throw new ApiError(400, "Error in updating workspace");
    }
    await redisClient.del(`workspace:${req.workspace._id}`)
    return res
        .status(200)
        .json(new ApiResponse(200, updatedWorkSpace, successMessage));
});

const assignContributor = asyncHandler(async (req, res) => {
    const redisClient = req.app.locals.redis;
    const {contributor} = req.body
    if (!contributor || !Array.isArray(contributor) || contributor.length === 0) {
        throw new ApiError(400, "Please provide at least one contributor email.")
    }
    const contributorIds = await getIdFromEmail(contributor)
    let successMessage ="contributor(s) assigned successfully"
    if(contributorIds.length != contributor.length){
        successMessage+="Some provided contributor emails were not found in the database."
    }

    const updatedWorkSpace = await Workspace.findByIdAndUpdate(
        req.workspace._id,
        { $addToSet: { contributors: { $each: contributorIds } } },
        { new: true }
    ).select("name owner contributors")

    if(!updatedWorkSpace){
        throw new ApiError(400, "Error in updating workspace");
    }
    await redisClient.del(`workspace:${req.workspace._id}`)
    return res
        .status(200)
        .json(new ApiResponse(200, updatedWorkSpace, successMessage));
});

const deleteWorkspace = asyncHandler(async (req, res) => {
    const redisClient = req.app.locals.redis;
    const workspaceTasks = req.workspace.tasks
    const session = await mongoose.startSession()
    session.startTransaction()
    
    try{
        if(workspaceTasks.length > 0 ){
            await Task.deleteMany({_id : {$in: workspaceTasks} }).session(session)
        }
        await Workspace.findByIdAndDelete(req.workspace._id).session(session)
        await redisClient.del(`workspace:${req.workspace._id}`)

        await session.commitTransaction()

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Workspace and associated tasks deleted successfully"))
    
    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(500, "Error deleting workspace and tasks")
    } finally {
        session.endSession();
    }
});

const removeAdmin = asyncHandler(async (req, res) => {
    const redisClient = req.app.locals.redis;
    const { admin } = req.body
    if (!admin || !Array.isArray(admin) || admin.length === 0) {
        throw new ApiError(400, "Please provide at least one admin email.")
    }
    const adminIds = await getIdFromEmail(admin)
    if (adminIds.length === 0) {
        throw new ApiError(404, "No matching admins found for provided emails.")
    }
    let successMessage = "Admin(s) removed successfully."
    if (adminIds.length !== admin.length) {
        successMessage += " Some provided admin emails were not found in the database."
    }

    const updatedWorkSpace = await Workspace.findByIdAndUpdate(
        req.workspace._id,
        { $pull: { admin: { $in: adminIds } } },
        { new: true }
    ).select("name owner admin")

    if (!updatedWorkSpace) {
        throw new ApiError(400, "Error updating workspace.")
    }
    await redisClient.del(`workspace:${req.workspace._id}`)
    return res
        .status(200)
        .json(new ApiResponse(200, updatedWorkSpace, successMessage))
});

const removeContributor = asyncHandler(async (req, res) => {
    const redisClient = req.app.locals.redis;
    const { contributor } = req.body
    if (!contributor || !Array.isArray(contributor) || contributor.length === 0) {
        throw new ApiError(400, "Please provide at least one contributor email.")
    }
    const contributorIds = await getIdFromEmail(contributor)
    if (contributorIds.length === 0) {
        throw new ApiError(404, "No matching contributors found for provided emails.")
    }
    let successMessage = "Contributor(s) removed successfully."
    if (contributorIds.length !== contributor.length) {
        successMessage += " Some provided contributor emails were not found in the database."
    }

    const updatedWorkSpace = await Workspace.findByIdAndUpdate(
        req.workspace._id,
        { $pull: { contributors: { $in: contributorIds } } },
        { new: true }
    ).select("name owner contributors")

    if (!updatedWorkSpace) {
        throw new ApiError(400, "Error updating workspace.")
    }
    await redisClient.del(`workspace:${req.workspace._id}`)
    return res
        .status(200)
        .json(new ApiResponse(200, updatedWorkSpace, successMessage))
});

const getWorkspace = asyncHandler(async (req, res) => {
    const redisClient = req.app.locals.redis
    const workspace = req.workspace
    await redisClient.set(`workspace:${workspace._id}`,JSON.stringify(workspace),"EX",3600 )
    return res
        .status(200)
        .json(new ApiResponse(200, workspace, "Workspace fetched successfully"))
});

export {
    createWorkspace,
    updateWorkspace,
    assignAdmin,
    assignContributor,
    deleteWorkspace,
    removeAdmin,
    removeContributor,
    getWorkspace
};
