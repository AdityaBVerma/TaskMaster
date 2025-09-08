import mongoose, {Schema} from "mongoose";

const workspaceSchema = new Schema({
/*
name
desc
owner
admin[]
contributors[] //cannot create tasks
tasks[]
*/
    name:{
        type: String,
        required: true
    },
    description: {
        type: String
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    admin: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    contributors: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    tasks: [
        {
            type: Schema.Types.ObjectId,
            ref: "Task"
        }
    ]
}, {timestamps: true})

export const Workspace = mongoose.model("Workspace", workspaceSchema)