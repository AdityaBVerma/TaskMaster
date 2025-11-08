import Redis from "ioredis"

const connectRedis = async () => {
    try {
        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"
        const client = new Redis(redisUrl)

        client.on("connect", () => {
            console.log("※※ Redis Connected (Cron) ※※")
        })
        client.on("error", (err) => {
            console.error("Redis Client Error:", err)
        })
        return client
    } catch (error) {
        console.error("Redis connection failed in cron/cache/index.js:", error);
        process.exit(1);
    }
};

export default connectRedis;
