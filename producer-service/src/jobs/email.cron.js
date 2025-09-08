import cron from "node-cron";
import Task from "../models/task.model.js";
import { Queue } from "bullmq";

const startEmailProducer = (redisClient) => {
    const emailQueue = new Queue("emails", { connection: redisClient });

    // Run every 2 minutes
    cron.schedule("*/2 * * * *", async () => {
        console.log("CRON: Checking pending EMAIL tasks...");

        try {
            const tasks = await Task.find({ type: "EMAIL", status: "PENDING" });

            for (const task of tasks) {
                await emailQueue.add("send-email", task.payload);
                console.log(`Produced EMAIL job → ${task._id}`);
            }
        } catch (err) {
            console.error("Error in email producer:", err);
        }
    });
};

export default startEmailProducer;
