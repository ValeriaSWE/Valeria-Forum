import dotenv from "dotenv"
import fs from "fs"
import FileReader from "FileReader"
import im from "imagemagick"

import Post from "../Schemas/Post.js"
import Comment from "../Schemas/Comment.js"

import { SomethingWrong } from "../errorMessages.js"
import User from "../Schemas/User.js"

import Tag from "../Schemas/Tag.js"
import Image from "../Schemas/Image.js"

dotenv.config()

export const CreatePost = async (req, res) => {
    const { title, content } = req.body
    const creator = req.userId

    console.log(req.files)

    let images = []

    if (req.files) {
        
        const promises = req.files.map(async image => {
            // images.push({ 
            //     data: image.buffer, 
            //     contentType: image.mimetype
            // })
            console.log(image.buffer)
            // console.log(fs.readFileSync('.png'))

            // console.log(image.mimetype)

            // try {
            //     im.resize({
            //         srcPath: image.mimetype.split('/')[1] + ":-",
            //         srcDst: "-",
            //         format: image.mimetype.split('/')[1],
            //         srcData: image.buffer,
            //         width:   10
            //       }, function(err, stdout, stderr){
            //         if (err) {
            //             throw err
            //         }
            //         console.log(stdout)
            //         // fs.writeFileSync('kittens-resized.jpg', stdout, 'binary');
            //         // console.log('resized kittens.jpg to fit within 256x256px')
            //       });
                
            // } catch (error) {
            //     console.error(error)                
            // }

            // console.log(images)
            try {
                
                const imgId = (await Image.create({ 
                        data: image.buffer, 
                        contentType: image.mimetype
                    }))._id
                    
                console.log(imgId)
                return imgId
            } catch (error) {
                console.error(error)
                return
            }
        });

        images = await Promise.all(promises)
        
    }
    
    // createNewPostTMP()
    
    try {
        await Post.create({ title, creator, content, images })
        return res.status(200).send("Post created succesfully")
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: SomethingWrong, error })
    }

}

export const createNewPostTMP = async () => {
    const { title, content, creator, images } = { title: "test", content: "testing testing", creator: "632639574179187c3a527f95", images: [] }

    try {
        await Post.create({ title, creator, content, images })
    } catch (error) {
        console.error(error)
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
                posts[k]['creator'] = await User.findById(posts[k]['creator']).populate('profilePicture')
            }
            

            return res.status(200).json(posts)
        } catch (error) {
            return res.status(500).send({ message: SomethingWrong, error })
        }
    }
}

export const GetPost = async (req, res) => {
    const { id } = req.params

    const post = await Post.findById(id).populate({
        path: 'creator',
        populate: { path: "profilePicture"}
    }).populate({
        path: 'comments',
        populate: [{ 
            path: 'creator',
            populate: { path: "profilePicture"},
        }, { path: "respondsTo", populate: { path: "creator" } }],
        // populate: { path: "respondsTo" },
    })

    // console.log(post)

    res.status(200).send(post)
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

    console.log(respondsTo)

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

    const comment = await (await Comment.create({ content, creator: userId, respondsTo })).populate({ 
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

// title: { type: String, required: true },
// creator: { type: mongoose.Schema.Types.ObjectId, required: true },
// content: { type: String, required: true },
// images: [{ data: Buffer, contentType: String }],
// createdAt: {type: Date, default: () => Date.now(), immutible: true},
// lastEditedAt: {type: Date, default: () => Date.now(), immutible: false},
// comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]