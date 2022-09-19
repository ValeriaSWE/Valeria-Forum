import mongoose from "mongoose"
import User from "../Schemas/User.js"


export const GetUserList = async (req, res) => {
    const userList = await User.find().limit(20)
    res.status(200).send(userList)
}

export const SetUserRole = async (req, res) => {
    const { id, newRole, newRoleRank } = req.body
    console.log(id, newRole, newRoleRank)

    const user = await User.findById(id)

    user.role = newRole
    user.roleRank = newRoleRank
    
    await user.save()

    res.status(200).send(user)
}