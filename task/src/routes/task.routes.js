import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimiter.middleware.js";
import { permission } from "../middlewares/permission.middleware.js";
import {
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    assignContributor
} from "../controllers/task.controller.js";

const router = Router();

router.use(verifyJWT);
router.use(createRateLimiter({ points: 10, duration: 10 }));

const taskPermissions = {
    manage: ["owner", "admin"],
    participate: ["owner", "admin", "contributor"]
};

router.route("/create/workspace/:wid").post(permission(taskPermissions.manage), createTask);

router.route("/update/workspace/:wid/task/:id").patch(permission(taskPermissions.manage), updateTask);

router.route("/toggle/workspace/:wid/task/:id").patch(permission(taskPermissions.participate), toggleTask);

router.route("/delete/workspace/:wid/task/:id").delete(permission(taskPermissions.manage), deleteTask);

router.route("/assignContributor/workspace/:wid/task/:id").patch(permission(taskPermissions.manage), assignContributor);

export default router;
