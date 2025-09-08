import {Workspace} from "../models/workspace.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const permission = (rolesAllowed = []) =>
    asyncHandler(async (req, _, next) => {
        const redisClient = req.app.locals.redis
        const wid = req.params.wid
        const userId = req.user._id

        let workspace = await redisClient.get(`workspace:${wid}`)
        if (workspace) {
            workspace = JSON.parse(workspace)
        } else {
            workspace = await Workspace.findById(wid).lean()
            if (!workspace) {
                throw new ApiError(404, "Workspace not found")
            }
            await redisClient.setEx(`workspace:${wid}`, 3600, JSON.stringify(workspace))
        }

        let userRole = null
        if (workspace.owner?.toString() === userId.toString()) {
        userRole = "owner"
        } else if (workspace.admins?.map(String).includes(userId.toString())) {
        userRole = "admin"
        } else if (workspace.contributors?.map(String).includes(userId.toString())) {
        userRole = "contributor"
        }

        if (!userRole) {
        throw new ApiError(403, "You are not part of this workspace")
        }

        if (!rolesAllowed.includes(userRole)) {
        throw new ApiError(403, "You do not have permission for this action")
        }
        req.userRole = userRole

        next()
    }
);
