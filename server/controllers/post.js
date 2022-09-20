import dotenv from "dotenv"

import Post from "../Schemas/Post.js"
import Comment from "../Schemas/Comment.js"

import { SomethingWrong } from "../errorMessages.js"
import User from "../Schemas/User.js"

dotenv.config()

export const createNewPost = async (req, res) => {
    const { title, content, creator, images } = req.body

    try {
        
    } catch (error) {
        return res.status(500).send({ message: SomethingWrong, error })
    }

}

export const createNewPostTMP = async () => {
    const { title, content, creator, images } = { title: "test", content: "testing testing", creator: "632639574179187c3a527f95", images: [] }

    try {
        await Post.create({ title, creator, content, images})
    } catch (error) {
        console.error(error)
    }
}

export const GetPosts = (pinned) => {
    return async (req, res) => {
        let posts = await Post.where("pinned").equals(pinned).populate('creator').limit(20)

        // console.log(posts)
        // console.log(pinned)

        res.status(200).json(posts)
    }
}

export const GetPost = async (req, res) => {
    const { id } = req.params

    const post = await Post.findById(id).populate('creator').populate({
        path: 'comments',
        populate: { path: 'creator' }
    })

    res.status(200).send(post)
}

export const NewComment = async (req, res) => {
    const { id } = req.params
    const { content } = req.body
    const { userId } = req

    const post = await Post.findById(id).populate('creator').populate('comments')

    const comment = await Comment.create({ content, creator: userId })

    post.comments.push(comment._id)

    post.save()

    res.status(200).send(post)
}

// title: { type: String, required: true },
// creator: { type: mongoose.Schema.Types.ObjectId, required: true },
// content: { type: String, required: true },
// images: [{ data: Buffer, contentType: String }],
// createdAt: {type: Date, default: () => Date.now(), immutible: true},
// lastEditedAt: {type: Date, default: () => Date.now(), immutible: false},
// comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]