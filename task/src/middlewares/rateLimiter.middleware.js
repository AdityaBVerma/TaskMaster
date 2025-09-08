import { ApiError } from "../utils/ApiError.js";
import { RateLimiterMemory } from "rate-limiter-flexible";
import asyncHandler from "../utils/asyncHandler.js";

export const createRateLimiter = ({ points = 5, duration = 10 } = {}) => {
    const rateLimiter = new RateLimiterMemory({ points, duration });

    return asyncHandler(async (req, _, next) => {
        const key = req.user?._id || req.ip;

        try {
        await rateLimiter.consume(key); 
        next();
        } catch (error) {
        throw new ApiError(
            429,
            error?.message || "Too many requests. Wait for a minute."
        );
        }
    });
};
