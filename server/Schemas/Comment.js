import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    content: { type: String, required: true },
    createdAt: {type: Date, default: () => Date.now(), immutible: true},
    lastEditedAt: {type: Date, default: () => Date.now(), immutible: false},
    respondsTo: {type: mongoose.Schema.Types.ObjectId, ref: "Comment"},
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
})

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;