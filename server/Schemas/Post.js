import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    content: { type: String, required: true },
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
    createdAt: {type: Date, default: () => Date.now(), immutible: true},
    lastEditedAt: {type: Date, default: () => Date.now(), immutible: false},
    isEdited: {type: Boolean, default: false},
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    pinned: { type: Boolean, default: false },
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: "Tag"}]
})

// * Uplading Images:
// * https://www.youtube.com/watch?v=GyzC-30Bqfc&t=648s

const Post = mongoose.model('Post', postSchema);

export default Post;