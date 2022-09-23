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

// createNewPostTMP()

/**
 * It gets all the posts from the database, sorts them by the sort parameter, and then returns them to
 * the frontend
 * @param pinned - boolean
 * @returns list with posts
 */
export const GetPosts = (pinned) => {
    return async (req, res) => {
        let { sort } = req.params
            
        let sortPort = {}
        let dir = -1
        if (sort.includes('-inverse')) {
            dir = 1
            sort = sort.split('-')[0]
        }

        sortPort[sort] = dir

        console.log(sort)

        let posts = await Post.aggregate([
            {
                $match: { pinned: pinned }
            },
            {
                $addFields: { interactionCount: { $add: [{$size: { "$ifNull": [ "$comments", [] ] } }, {$size: { "$ifNull": [ "$likes", [] ] } }]} }
            },
            {
                $sort: sortPort
            },
        ])
        

        for (var k in posts) {
            posts[k]['creator'] = await User.findById(posts[k]['creator'])
            console.log(posts[k]['interactionCount'])
        }

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

export const LikePost = async (req, res) => {
    const { id } = req.params
    const { userId } = req

    const post = await Post.findById(id)

    if (post.likes.includes(userId)) {
        post.likes.remove(userId)
    } else {
        post.likes.push(userId)
    }

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