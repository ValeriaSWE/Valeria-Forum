import dotenv from "dotenv"
import fs from "fs"

import Post from "../Schemas/Post.js"
import Comment from "../Schemas/Comment.js"

import { SomethingWrong } from "../errorMessages.js"
import User from "../Schemas/User.js"

import multer from 'multer'
import Tag from "../Schemas/Tag.js"

dotenv.config()

export const CreatePost = async (req, res) => {
    console.log(req)
    const { title, content } = req.body
    // const imagesTmp = req.body.images

    const creator = req.userId

    // let images = []
    // imagesTmp.forEach(image => {
    //     console.log(fs.readFileSync("./controllers/default_pfp_250px.png"))

    //     console.log("image:")
    //     console.log(image)
    //     // images.push(fs.readFileSync(image))
    // });

    res.send('yes')

    try {

        await Post.create({ title, creator, content })
    } catch (error) {
        return res.status(500).send({ message: SomethingWrong, error })
    }

}

export const createNewPostTMP = async () => {
    const { title, content, creator, images } = { title: "test", content: "testing testing", creator: "632639574179187c3a527f95", images: [] }

    try {
        await Post.create({ title, creator, content, images})
    } catch (error) {
        return res.status(500).send({ message: SomethingWrong, error })
    }
}

async function createTagTMP(name) {
    await Tag.create({name})
}

// createTagTMP("General")

/**
 * It gets all the posts from the database, sorts them by the sort parameter, and then returns them to
 * the frontend
 * @param pinned - boolean
 * @returns list with posts
 */
export const GetPosts = (pinned) => {
    return async (req, res) => {
        let { sort, startIndex } = req.query
        
        let sortPort = {}
        let dir = -1
        if (sort.includes('-inverse')) {
            dir = 1
            sort = sort.split('-')[0]
        }

        sortPort[sort] = dir

        try {

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
                {
                    $skip: Number(startIndex)
                },
                {
                    $limit: 10
                },
                {
                    $lookup: {
                        from: 'tags',
                        localField: 'tags',
                        foreignField: '_id',
                        as: 'tags'
                    }
                }
            ])
            

            for (var k in posts) {
                posts[k]['creator'] = await User.findById(posts[k]['creator'])
            }
            

            return res.status(200).json(posts)
        } catch (error) {
            return res.status(500).send({ message: SomethingWrong, error })
        }
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