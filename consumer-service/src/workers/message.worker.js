import {Worker } from "bullmq"
import nodemailer from "nodemailer"

const startMessageWorker = (redisConnection) => {
    const emailWorker = new Worker(
        "messages",
        async (job) => {
            const {subject, task, email} = job.data
            const transporter = nodemailer.createTransport({
                service:"gmail",
                auth:{
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            })
            const mailOptions = {
                from: `"Task Remainder" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Deadline Remailder for: ${subject}`,
                text: `Hello, this is a reminder for your task "${subject}" that’s due soon.`,
                html: `<p>Hello,</p>
                    <p>This is a reminder for your task: <b>${subject}</b>.</p>
                    <p>Please make sure it’s completed before the deadline.</p>
                    <p>– TaskMaster System</p>`,
            }
            try{
                await transporter.sendMail(mailOptions)
            } catch (error){
                console.error(`Failed to send email to ${email}:`, error);
                throw error;
            }
        },
        {connection: redisConnection})

    emailWorker.on("completed", (job)=>{
        console.log(`Message job Successfull: jobId - ${job.id}`)
    })
    emailWorker.on("failed", (job, error)=>{
        console.log(`Message job Failed: jobId - ${job.id}`, error.message)
    })
}

export default startMessageWorker