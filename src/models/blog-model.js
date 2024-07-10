import mongoose, {Schema} from "mongoose"

const blogSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {timestamps: true});

export const Blog = new mongoose.model("Blog", blogSchema)