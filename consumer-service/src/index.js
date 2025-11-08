import connectRedis from "../../producer-service/src/cache";
import dotenv from "dotenv"
import startEmailWorker from "./workers/email.worker";
import startMessageWorker from "./workers/message.worker";

dotenv.config({path: "./.env" })

connectRedis()
.then(redisClient => {
    console.log("Worker service Started");
    // worker queue functions here
    startEmailWorker(redisClient)
    startMessageWorker(redisClient)
})
.catch((error) => {
    console.error("Connection error at cron/index.js:", error)
    process.exit(1);
})