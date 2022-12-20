import jwt from "jsonwebtoken"
import { AuthLevel, InvalidToken } from "../errorMessages.js"

export const checkUserLoginTimeout = async (req, res) => {
    const { token } = req.body

    jwt.verify(token, process.env.JWT_TOKEN, function(err, decoded) {
        if (err) return res.status(200).send(false)
        return res.status(200).send(true)

    })
}

export const Authorize = (authLevel) => {

    return (req, res, next) => {
        
        const token = req.headers.authorization.split(' ')[1]
        jwt.verify(token, process.env.JWT_TOKEN, function(err, decoded) {
            if (err) return res.status(400).send({message: InvalidToken, err})
            if (decoded.roleRank < authLevel) return res.status(400).send({message: AuthLevel, err})
            
            req.userId = decoded.id
            next()
        })
    }
} 