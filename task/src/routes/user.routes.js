import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createRateLimiter } from "../middlewares/rateLimiter.middleware.js";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails 
} from "../controllers/user.controller.js"

const options = {
    points : 2,
    duration : 10
}

const router = Router()

router.route("/register").post(createRateLimiter(options), registerUser)

router.route("/login").post(createRateLimiter(options), loginUser)

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").patch(verifyJWT, createRateLimiter(options), changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-account").patch(verifyJWT, createRateLimiter(options), updateAccountDetails)


export default router
