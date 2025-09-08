import cron from "node-cron";
import Task from "../models/task.model.js";
import { Queue } from "bullmq";

const startMessageProducer = (redisClient) => {
    const messageQueue = new Queue("messages", { connection: redisClient });

    cron.schedule("* * * * *", async () => {
        console.log("CRON: Checking pending MESSAGE tasks...");

        try {
            const tasks = await Task.find({ type: "MESSAGE", status: "PENDING" });

            for (const task of tasks) {
                await messageQueue.add("send-message", task.payload);
                console.log(`Produced MESSAGE job → ${task._id}`);
            }
        } catch (err) {
            console.error("Error in message producer:", err);
        }
    });
};

export default startMessageProducer;
