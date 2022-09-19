import jwt from "jsonwebtoken"
import { AuthLevel, InvalidToken } from "../errorMessages.js"

export const checkUserLoginTimeout = async (req, res) => {
    const { token } = req.body
    // console.log(token)

    // const decodedData = jwt.decode(token)
    jwt.verify(token, process.env.JWT_TOKEN, function(err, decoded) {
        if (err) return res.status(200).send(false)
        console.log(decoded)
        return res.status(200).send(true)

    })
    // console.log(decodedData.exp * 1000)
    // console.log(Date.now() - decodedData.exp * 1000)
    // return Date.now() >= decodedData.exp * 1000
}

export const Authorize = (authLevel) => {
    
    console.log(authLevel)

    return (req, res, next) => {
        
        // console.log(req.headers.authorization.split(' ')[1])

        const token = req.headers.authorization.split(' ')[1]
        jwt.verify(token, process.env.JWT_TOKEN, function(err, decoded) {
            if (err) return res.status(400).send({message: InvalidToken, err})
            // return res.status(200).send(true)
            if (decoded.roleRank < authLevel) return res.status(400).send({message: AuthLevel, err})
            
            req.userId = decoded.id
            next()
        })
    }
} 