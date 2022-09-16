import express from "express"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

import User from "../Schemas/User.js"

dotenv.config()

export const loginUser = async (req, res) => {
    const { username, password } = req.body

    try {
        const existingUser = await User.findOne({ email: username })

        if(!existingUser) return res.status(404).json({ message: "User doesn't exist." })

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)

        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid password" })

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JWT_TOKEN, { expiresIn: process.env.JWT_TIMEOUT})

        return res.status(200).send({ result: existingUser, token })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: "Something went wrong.", error })
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
    const { username, password, passwordConfirm } = req.body

    try {
        const existingUser = await User.findOne({ email: username })

        if(existingUser) return res.status(400).json({ message: "User already exists." })

        if(password !== passwordConfirm) return res.status(400).json({ message: "Password doesn't match." })

        const hashedPassword = await bcrypt.hash(password, 12)

        const result = await User.create({ email: username, password: hashedPassword })

        const token = jwt.sign({ email: result.email, id: result._id }, process.env.JWT_TOKEN, { expiresIn: process.env.JWT_TIMEOUT})

        return res.status(200).send({ result, token })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: "Something went wrong.", error })
    }
}

// app.post('/user/login', (req, res) => {
//     // console.log(req.headers)
//     // res.append("hello", "world")
//     // res.type('application/json')
//     console.log(req.body)
//     res.status(200).json({hello: "world"})
// })

// app.post('/user/register', (req, res) => {
//     // console.log(req.headers)
//     // res.append("hello", "world")
//     // res.type('application/json')
//     console.log(req.body)
//     res.status(200).send("Succesfully created user")
// })