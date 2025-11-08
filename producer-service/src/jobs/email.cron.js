import cron from "node-cron";
import Task from "../models/task.model.js";
import { Queue } from "bullmq";

//NOTE: the next time ill use redis lists not bullmq, it's just dumb  your goal was to learn redis 

const startEmailProducer = (redisConnection) => {
    const emailQueue = new Queue("email", {connection: redisConnection})

    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
            const tasks = await Task.find({
                status : "pending",
                deadline : {$gte: now , $lte:next24Hours}
            })
            .populate("assignedto", "email")
            .select("deadline name assignedto _id")
            //FEATURE: add bool in the schema so that remainder wont be sent twice
            //NOTE: i believe doing the deadline part in the mongodb server will be better than to do it here as more bandwidht also mongodb will do it faster there
            for(const task of tasks){
                for(const user of task.assignedto){
                    await emailQueue.add(
                        "send-email", 
                        {subject: task.name, task: task._id, email: user.email}, 
                        {jobId: `${task._id}-${user.email}`, attempts: 3, backoff:{ type: "exponential", delay: 5000}, removeOnComplete: true}
                    )
                    console.log(`Produced Email job ${task.id}-${task.name} for ${user.email}`)
                    //NOTE: i think instead of ending entire task id i should send them in individual jobs for esach user as this would avoid db call in worker worker can be scaled horizontally and the most important maintain unit transactions for worker email service
                    //FIXME: remove console log due to overwhelming number of logs i have used and this would be exponential
                }
            }
        } catch (error) {
            console.log("Error in email producer: ", error);
            //TODO: Fallback Logic to job queue
            //TODO: add worker response
        }
    })
}

export default startEmailProducer;
