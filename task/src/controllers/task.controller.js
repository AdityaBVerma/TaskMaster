import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTask = asyncHandler(async (req, res) => {
    return res
        .status(201)
        .json(new ApiResponse(201, {}, "Task created successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Task updated successfully"));
});

const toggleTask = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Task toggled successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Task deleted successfully"));
});

const assignContributor = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Contributor assigned successfully"));
});

export {
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    assignContributor
};
