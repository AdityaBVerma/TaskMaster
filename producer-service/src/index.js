import dotenv from "dotenv";
import connectDB from "./db/index.js";
import connectRedis from "./cache/index.js";
import startMessageProducer from "./jobs/message.cron.js";
import startEmailProducer from "./jobs/email.cron.js";

dotenv.config({ path: "./.env" });

connectDB()
    .then(() => connectRedis())
    .then(redisClient => {
        console.log("※※ CRON service started ✅ ※※");

        global.redis = redisClient;

        startMessageProducer(redisClient);
        startEmailProducer(redisClient);
    })
    .catch(error => {
        console.error("Connection error at cron/index.js:", error);
        process.exit(1);
});
