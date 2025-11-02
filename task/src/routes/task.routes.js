import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createRateLimiter } from "../middlewares/rateLimiter.middleware.js";
import { permission } from "../middlewares/permission.middleware.js";
import {
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    assignContributor,
    removeContributor,
    changeDeadline,
    getTask
} from "../controllers/task.controller.js";
import { cacheTask } from "../middlewares/taskCache.middleware.js";

const router = Router();

router.use(verifyJWT);
router.use(createRateLimiter({ points: 10, duration: 10 }));

const taskPermissions = {
    manage: ["owner", "admin"],
    participate: ["owner", "admin", "contributor"]
};

router.route("/create/workspace/:wid").post(permission(taskPermissions.manage), createTask);

router.route("/update/workspace/:wid/task/:id").patch(permission(taskPermissions.manage), cacheTask, updateTask);

router.route("/toggle/workspace/:wid/task/:id").patch(permission(taskPermissions.participate), cacheTask, toggleTask);

router.route("/delete/workspace/:wid/task/:id").delete(permission(taskPermissions.manage), cacheTask, deleteTask);

router.route("/assignContributor/workspace/:wid/task/:id").patch(permission(taskPermissions.manage), cacheTask, assignContributor);

router.route("/removeContributor/workspace/:wid/task/:id").patch(permission(taskPermissions.manage), cacheTask, removeContributor)

router.route("/changeDeadline/workspace/:wid/task/:id").patch(permission(taskPermissions.manage), cacheTask, changeDeadline)

router.route("/get/workspace/:wid/task/:id").get(permission(taskPermissions.participate), cacheTask, getTask)

export default router;
