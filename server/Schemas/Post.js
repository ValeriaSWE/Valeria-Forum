import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, required: true },
    content: { type: String, required: true },
    images: [{ data: Buffer, contentType: String }],
    createdAt: {type: Date, default: () => Date.now(), immutible: true},
    lastEditedAt: {type: Date, default: () => Date.now(), immutible: false},
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
})

const Post = mongoose.model('Post', postSchema);

export default Post;