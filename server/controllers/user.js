import express from "express"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import fs from "fs"

import User from "../Schemas/User.js"

dotenv.config()

export const loginUser = async (req, res) => {
    const { username, password } = req.body

    try {
        const existingUser = await User.findOne({ username: username })

        if(!existingUser) return res.status(404).json({ message: "User doesn't exist." })

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)

        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid password" })

        const token = jwt.sign({ username: existingUser.username, id: existingUser._id }, process.env.JWT_TOKEN, { expiresIn: process.env.JWT_TIMEOUT})

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
    const { email, password, passwordConfirm, username } = req.body

    try {
        const existingUser = await User.findOne({ username: username })

        if(existingUser) return res.status(400).json({ message: "User already exists." })

        if(password !== passwordConfirm) return res.status(400).json({ message: "Password doesn't match." })

        const hashedPassword = await bcrypt.hash(password, 12)

        const profilePicture = fs.readFileSync("./controllers/default_pfp.png")

        const result = await User.create({ username: username, password: hashedPassword, email: email, profilePicture: { data: profilePicture, contentType: "image/png" } })

        const token = jwt.sign({ username: result.username, id: result._id }, process.env.JWT_TOKEN, { expiresIn: process.env.JWT_TIMEOUT})

        return res.status(200).send({ result, token })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: "Something went wrong.", error })
    }
}

export const checkUserLoginTimeout = async (req, res) => {
    
}