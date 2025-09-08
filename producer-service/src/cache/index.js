import { createClient } from "redis";

const connectRedis = async () => {
    try {
        const client = createClient({
            url: process.env.REDIS_URL || "redis://localhost:6379"
        });

        client.on("error", (err) => console.error("Redis Client Error", err));
        await client.connect();

        console.log("※※ Redis Connected (Cron) ※※");
        return client;
    } catch (error) {
        console.error("Redis connection failed in cron/cache/index.js:", error);
        process.exit(1);
    }
};

export default connectRedis;
