import { User } from "../models/user.model.js";

export const getIdFromEmail = async (emails = []) => {
    if(!Array.isArray(emails) || emails.length == 0)  return []

    const properEmails = emails.map((email) => email.trim()?.toLowerCase()).filter(Boolean)

    if(properEmails.length == 0) return [];
    
    const users = await User.find({email : {$in : properEmails}}).select("_id");
    
    return users.map(user => user._id);
}
