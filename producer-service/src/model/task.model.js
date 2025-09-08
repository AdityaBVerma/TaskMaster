import mongoose, {Schema} from "mongoose";

const taskSchema = new Schema({
/*
name
desc
deadline
createdby
assignedto[]
status
*/
    name:{
        type: String,
        required: true
    },
    description: {
        type: String
    },
    deadline: {
        type: Date,
        required: true,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    assignedto: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    status : {
        type: String,
        enum: ['pending', 'done'],
        default: 'pending',
        required: true,
    }
}, {timestamps: true});

export const Task = mongoose.model("Task", taskSchema)