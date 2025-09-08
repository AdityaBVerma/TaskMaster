import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createWorkspace = asyncHandler(async (req, res) => {
    return res
        .status(201)
        .json(new ApiResponse(201, {}, "Workspace created successfully"));
});

const updateWorkspace = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Workspace updated successfully"));
});

const assignAdmin = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Admin assigned successfully"));
});

const assignContributor = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Contributor assigned successfully"));
});

const deleteWorkspace = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Workspace deleted successfully"));
});

const removeAdmin = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Admin removed successfully"));
});

const removeContributor = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Contributor removed successfully"));
});

export {
    createWorkspace,
    updateWorkspace,
    assignAdmin,
    assignContributor,
    deleteWorkspace,
    removeAdmin,
    removeContributor
};
