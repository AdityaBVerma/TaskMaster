import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createRateLimiter } from "../middlewares/rateLimiter.middleware.js";
import { permission } from "../middlewares/permission.middleware.js";
import {
    createWorkspace,
    updateWorkspace,
    assignAdmin,
    assignContributor,
    deleteWorkspace,
    removeAdmin,
    removeContributor,
    getWorkspace
} from "../controllers/workspace.controller.js";

const router = Router()

router.use(verifyJWT)
router.use(createRateLimiter({points: 1, duration: 10}))
export const workspacePermissions = {
    manage: ["owner", "admin"],
    full: ["owner"],
    contribute: ["owner", "admin", "contributor"]
};

router.route("/create").post(createWorkspace);

router.route("/update/:wid").patch(permission(workspacePermissions.manage), updateWorkspace);

router.route("/assignAdmin/:wid").patch(permission(workspacePermissions.full), assignAdmin);

router.route("/assignContributor/:wid").patch(permission(workspacePermissions.manage), assignContributor);

router.route("/delete/:wid").delete(permission(workspacePermissions.full), deleteWorkspace);

router.route("/removeAdmin/:wid").patch(permission(workspacePermissions.full), removeAdmin);

router.route("/removeContributor/:wid").patch(permission(workspacePermissions.manage), removeContributor);

router.route("/get/:wid").get(permission(workspacePermissions.contribute), getWorkspace);

export default router