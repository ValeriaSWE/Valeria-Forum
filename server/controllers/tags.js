import Tag from "../Schemas/Tag.js"
import User from "../Schemas/User.js"

export const GetTags = async (req, res) => {
    if (req.userId) {
        const user = await User.findById(req.userId)

        const tags = await Tag.find().where('minRank').lte(user.roleRank)

        return res.status(200).send(tags)
    }
}
export const GetAllTags = async (req, res) => {
    const tags = await Tag.find()

    return res.status(200).send(tags)
}