import dotenv from "dotenv"
import fs from "fs"
import FileReader from "FileReader"
import im from "imagemagick"

import Post from "../Schemas/Post.js"
import Comment from "../Schemas/Comment.js"

import { NotYourPost, PostDoesntExists, SomethingWrong } from "../errorMessages.js"
import User from "../Schemas/User.js"

import Tag from "../Schemas/Tag.js"
import Image from "../Schemas/Image.js"

dotenv.config()

export const CreatePost = async (req, res) => {
    const { title, content } = req.body
    const creator = req.userId

    // console.log(req.files)

    let images = []

    if (req.files) {
        
        const promises = req.files.map(async image => {
            try {
                
                const imgId = (await Image.create({ 
                        data: image.buffer, 
                        contentType: image.mimetype
                    }))._id
                    
                // console.log(imgId)
                return imgId
            } catch (error) {
                console.error(error)
                return
            }
        });

        images = await Promise.all(promises)
        
    }
        
    try {
        const post = await Post.create({ title, creator, content, images })

        const user = await User.findById(creator)

        user.numberOfPosts++

        await user.save()

        return res.status(200).send(post._id)
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: SomethingWrong, error })
    }

}

export const EditPost = async (req, res) => {
    const { postId, content } = req.body
    const creator = req.userId

    try {
        const post = await Post.findById(postId)

        // console.log(post)

        if (!post) return res.status(500).send(PostDoesntExists)

        if (post.creator != creator) return res.status(500).send(NotYourPost)

        post.content = content

        post.lastEditedAt = Date.now()
        post.isEdited = true

        await post.save()

        return res.status(200).send(post)
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: SomethingWrong, error })
    }
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
        let { sort, page, limit } = req.query
        
        let sortPort = {}
        let dir = -1
        if (sort.includes('-inverse')) {
            dir = 1
            sort = sort.split('-')[0]
        }

        sortPort[sort] = dir

        // console.log(Number(page) * Number(limit))
        // console.log(pinned)

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
                    $skip: Number(page) * Number(limit)
                },
                {
                    $limit: Number(limit)
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
            
            const pages = Math.ceil((await Post.count()) / Number(limit))

            for (var k in posts) {
                posts[k]['creator'] = await User.findById(posts[k]['creator']).populate('profilePicture')
            }
            

            return res.status(200).json({ posts, pages })
        } catch (error) {
            console.error(error)
            return res.status(500).send({ message: SomethingWrong, error })
        }
    }
}

export const GetPost = async (req, res) => {
    const { id } = req.params
    let { commentSort, commentPage, commentLimit } = req.query


    const post = await Post.findById(id).populate({
        path: 'creator',
        populate: { path: "profilePicture"}
    }).populate({
        path: 'comments',
        populate: [{ 
            path: 'creator',
            populate: { path: "profilePicture"},
        }, { path: "respondsTo", populate: { path: "creator" } }],
    })

    const commentPages = Math.ceil(post.comments.length / Number(commentLimit))

    if (commentSort.split('-')[0] == 'createdAt') {
        post.comments.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1)
    } else if (commentSort.split('-')[0] == 'interactionCount') {
        post.comments.sort((a, b) => (a.likes.length < b.likes.length) ? 1 : -1)
    }

    if (commentSort.split('-')[1] == 'inverse') {
        post.comments.reverse()
    }

    // let commentPageDict = new Map()
    let commentPageDict = {}

    for (let i = 0; i < post.comments.length; i++) {
        // if (post.comments[i].respondsTo) {
        //     var index = 0
        //     for (var j = 0; j < post.comments.length; j++) {
        //         if (String(post.comments[j]._id) == String(post.comments[i].respondsTo._id)) {
        //             index = j
        //             break
        //         }
        //     }
        //     post.comments[i].respondsTo.__v = Math.ceil((index + 1) / commentLimit)
        // }
        // commentPageDict.set(String(post.comments[i]._id), Math.ceil((i) / commentLimit))
        commentPageDict[String(post.comments[i]._id)] = Math.ceil((i + 1) / commentLimit)
    }

    post.comments = post.comments.slice(Number(commentPage) * Number(commentLimit), Number(commentPage) * Number(commentLimit) + Number(commentLimit))
    
    
    // console.table(commentPageDict)
    res.status(200).send({ post, commentPages, commentPageDict})
}

export const GetImage = async (req, res) => {
    const { id } = req.params

    const image = await Image.findById(id)

    res.status(200).send(image)
}

export const NewComment = async (req, res) => {
    const { id } = req.params
    const { content, respondsTo } = req.body
    const { userId } = req

    // console.log(respondsTo)

    const post = await Post.findById(id).populate({
        path: 'creator',
        populate: { path: "profilePicture"}
    }).populate({
        path: 'comments',
        populate: { 
            path: 'creator',
            populate: { path: "profilePicture"}
        }
    })

    const comment = await (await Comment.create({ content, creator: userId, respondsTo, onPost: id })).populate({ 
        path: 'creator',
        populate: { path: "profilePicture"}
    })

    post.comments.push(comment._id)

    await post.save()

    const updatedPost = await Post.findById(post._id).populate({
        path: 'creator',
        populate: { path: "profilePicture"}
    }).populate({
        path: 'comments',
        populate: [{ 
            path: 'creator',
            populate: { path: "profilePicture"},
        }, { path: "respondsTo", populate: { path: "creator" } }]
    }) 

    const user = await User.findById(userId)

    user.numberOfComments++

    await user.save()

    return res.status(200).send(updatedPost)
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

export const LikeComment = async (req, res) => {
    const { id } = req.params
    const { userId } = req

    const comment = await Comment.findById(id)

    if (comment.likes.includes(userId)) {
        comment.likes.remove(userId)
    } else {
        comment.likes.push(userId)
    }

    comment.save()

    res.status(200).send(comment)
}


// const tmpRemComments = async () => {
//     const posts = await Post.find()
    
//     posts.forEach(async post => {
//         post.comments = []
        
//         await post.save()
//     })
// }
// tmpRemComments()