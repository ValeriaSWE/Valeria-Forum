import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import fs from "fs"

import User from "../Schemas/User.js"
import { IncorrectPassword, InvalidToken, PasswordDontMatch, PasswordToShort, SomethingWrong, UserDoesntExists, UsernameTaken } from "../errorMessages.js"
import Image from "../Schemas/Image.js"
import Post from "../Schemas/Post.js"
import Comment from "../Schemas/Comment.js"
import mongoose from "mongoose"

dotenv.config()

/**
 * It takes the username and password from the request body, checks if the username is an email or not,
 * then checks if the user exists, if it does, it checks if the password is correct, if it is, it
 * creates a token and sends it back to the client.
 * </code>
 * @param req - request
 * @param res - The response object.
 * @returns The user object and the token.
 */
export const loginUser = async (req, res) => {
    const { username, password } = req.body

    try {
        const usernameIsEmail = username.includes('@')

        let existingUser
        
        if (usernameIsEmail) {
            existingUser = await User.findOne({ email: new RegExp(`^${username}$`, 'i') }).populate('profilePicture')
        } else {
            existingUser = await User.findOne({ username: new RegExp(`^${username}$`, 'i') }).populate('profilePicture')
        }

        if(!existingUser) return res.status(404).json({ message: UserDoesntExists })

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)

        if (!isPasswordCorrect) return res.status(400).json({ message: IncorrectPassword })

        const token = jwt.sign({ username: existingUser.username, roleRank: existingUser.roleRank, id: existingUser._id }, process.env.JWT_TOKEN, { expiresIn: process.env.JWT_TIMEOUT })

        return res.status(200).send({ result: existingUser, token })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: SomethingWrong, error })
    }
}


/**
 * It takes the username, password, and passwordConfirm from the request body, checks if the user
 * already exists, checks if the password and passwordConfirm match, hashes the password, and then
 * creates the user in the database
 * @param req - request
 * @param res - response
 * @returns The result of the create method.
 */
export const registerUser = async (req, res) => {
    const { email, password, passwordConfirm, username } = req.body

    try {
        const existingUser = await User.findOne({ username: new RegExp(`^${username}$`, 'i') })

        if(existingUser) return res.status(400).json({ message: UsernameTaken })

        if(password.length < 8) return res.status(400).json({ message: PasswordToShort })

        if(password !== passwordConfirm) return res.status(400).json({ message: PasswordDontMatch })

        const hashedPassword = await bcrypt.hash(password, 12)

        let result = await User.create({ username: username, password: hashedPassword, email: email })

        result.profilePicture = await Image.findById(result.profilePicture)

        const token = jwt.sign({ username: result.username, roleRank: result.roleRank, id: result._id }, process.env.JWT_TOKEN, { expiresIn: process.env.JWT_TIMEOUT})

        return res.status(200).send({ result, token })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: SomethingWrong, error })
    }
}

export const GetUserInfo = async (req, res) => {
    const { id } = req.params
    
    try {
        let user
        if (id.length == 24) user = await User.findById(id).populate('profilePicture')

        if (!user) user = await User.findOne({ username: id }).populate('profilePicture')

        if (!user) return res.status(404).send({ message: UserDoesntExists })


        return res.status(200).send(user)
    } catch (error) {
        return res.status(500).send({ message: SomethingWrong, error })
    }
}

export const GetUserPosts = async (req, res) => {
    let { sort, page, limit } = req.query
    const { id } = req.params
        
    let sortPort = {}
    let dir = -1
    if (sort.includes('-inverse')) {
        dir = 1
        sort = sort.split('-')[0]
    }

    sortPort[sort] = dir

    try {

        const posts = await Post.aggregate([
            {
                $match: { creator: mongoose.Types.ObjectId(id) }
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
        
        
        const pages = Math.ceil((await Post.find({creator: id}).count()) / Number(limit))
        
        // for (var k in posts) {
        //     posts[k]['creator'] = await User.findById(posts[k]['creator']).populate('profilePicture')
        // }
        

        return res.status(200).json({ posts, pages })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: SomethingWrong, error })
    }
}

export const GetUserComments = async (req, res) => {
    let { sort, page, limit } = req.query
    const { id } = req.params
        
    let sortPort = {}
    let dir = -1
    if (sort.includes('-inverse')) {
        dir = 1
        sort = sort.split('-')[0]
    }

    sortPort[sort] = dir

    try {

        const comments = await Comment.aggregate([
            {
                $match: { creator: mongoose.Types.ObjectId(id) }
            },
            {
                $addFields: { interactionCount: { $add: [ {$size: { "$ifNull": [ "$likes", [] ] } }]} }
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
                    from: 'comments',
                    localField: 'respondsTo',
                    foreignField: '_id',
                    as: 'respondsTo'
                }
            }
        ])
        
        for (let i in comments) {
            comments[i].respondsTo = comments[i].respondsTo[0]
        }
        
        const pages = Math.ceil((await Comment.find({creator: id}).count()) / Number(limit))
        
        // for (var k in posts) {
        //     posts[k]['creator'] = await User.findById(posts[k]['creator']).populate('profilePicture')
        // }
        

        return res.status(200).json({ comments, pages })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: SomethingWrong, error })
    }
}

export const SetUserInfo = async (req, res) => {
    const {newUsername, oldPassword, newPassword, newPasswordConfirm, about} = req.body
    try {
        const user = await User.findById(req.userId)

        if (!user) return res.status(400).send({ message: InvalidToken })

        if (!(await bcrypt.compare(oldPassword, user.password))) return res.status(400).send({ message: InvalidToken })


        if (newUsername) {
            user.username = newUsername
        }
        if (newPassword && newPasswordConfirm) {
            if (newPassword == newPasswordConfirm) {
                user.password = bcrypt.hash(newPassword, 12)
            } else {
                res.status(400).send({message: PasswordDontMatch })
            }
        }
        user.about = about

        await user.save()
        user.profilePicture = await Image.findById(user.profilePicture)
        const token = jwt.sign({ username: user.username, roleRank: user.roleRank, id: user._id }, process.env.JWT_TOKEN, { expiresIn: process.env.JWT_TIMEOUT })

        return res.status(200).send({user, token})
    } catch (error) {
        console.error(error)
        return res.status(400).send({ message: SomethingWrong, error })
    }



    // if (bcrypt.compare(oldPassword, ))
}