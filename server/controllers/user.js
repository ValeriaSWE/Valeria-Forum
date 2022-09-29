import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import fs from "fs"

import User from "../Schemas/User.js"
import { IncorrectPassword, PasswordDontMatch, PasswordToShort, SomethingWrong, UserDoesntExists, UsernameTaken } from "../errorMessages.js"
import Image from "../Schemas/Image.js"

dotenv.config()

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

        // const profilePicture = fs.readFileSync("./controllers/default_pfp_250px.png")

        let result = await User.create({ username: username, password: hashedPassword, email: email })

        result.profilePicture = await Image.findById(result.profilePicture)

        const token = jwt.sign({ username: result.username, roleRank: result.roleRank, id: result._id }, process.env.JWT_TOKEN, { expiresIn: process.env.JWT_TIMEOUT})

        return res.status(200).send({ result, token })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: SomethingWrong, error })
    }
}

// async function tmp() {
//     console.log(await Image.findOne({ data: fs.readFileSync("./controllers/default_pfp_250px.png")}))
// }

// tmp()

// async function tmp() {
//     await User.updateMany({}, {
//         $set: {
//             profilePicture: "6335abe12ff7b5bff877f976"
//         }
//     })
// }

// tmp()

// tmp()

// export const checkUserLoginTimeout = async (req, res) => {
//     const { token } = req.body
//     // console.log(token)

//     // const decodedData = jwt.decode(token)
//     jwt.verify(token, process.env.JWT_TOKEN, function(err, decoded) {
//         if (err) return res.status(200).send(false)
//         return res.status(200).send(true)

//     })
//     // console.log(decodedData.exp * 1000)
//     // console.log(Date.now() - decodedData.exp * 1000)
//     // return Date.now() >= decodedData.exp * 1000
// }