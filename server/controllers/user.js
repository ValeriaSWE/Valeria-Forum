import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import fs from "fs"

import User from "../Schemas/User.js"
import { IncorrectPassword, PasswordDontMatch, PasswordToShort, SomethingWrong, UserDoesntExists, UsernameTaken } from "../errorMessages.js"
import Image from "../Schemas/Image.js"
import Post from "../Schemas/Post.js"
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
            existingUser = await User.findOne({ email: username }).populate('profilePicture')
        } else {
            existingUser = await User.findOne({ username: username }).populate('profilePicture')
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
        const existingUser = await User.findOne({ username: username })

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
        const user = await User.findById(id).populate('profilePicture')

        if (!user) return res.status(404).send({ message: UserDoesntExists })


        return res.status(200).send(user)
    } catch (error) {
        return res.status(500).send({ message: SomethingWrong, error })
    }
}

export const GetUserPosts = async (req, res) => {
    const { id } = req.params
    
    try {
        const posts = await Post.aggregate([
            {
                $match: { creator: mongoose.Types.ObjectId(id) }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: 0
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

        return res.status(200).send(posts)
    } catch (error) {
        return res.status(500).send({ message: SomethingWrong, error })
    }

}