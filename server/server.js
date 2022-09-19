import express from 'express'
const app = express()   
const port = 8000

import mongoose from 'mongoose'
import cors from 'cors'

import { loginUser, registerUser } from "./controllers/user.js"
import { checkUserLoginTimeout, Authorize } from "./middleware/user.js"
import { GetUserList, SetUserRole } from './controllers/admin.js'
import { GetPosts } from './controllers/post.js'

app.use(express.json())
// app.get('/', (req, res) => res.send('Hello World!'))

// app.use(bodyParser.json({ limit: '30mb', extended: true }))
// app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(cors());

const uri = "mongodb+srv://vaforum:MQNai79kxLGmpUC1@cluster0.v3wgq.mongodb.net/?retryWrites=true&w=majority"

async function connect() {
    try {
        await mongoose.connect(uri)
        console.log('Connected to MongoDB')
    } catch (error) {
        console.error(error);
    }
}

connect()


app.post('/user/login', loginUser)

app.post('/user/register', registerUser)

// app.post('/user/checkToken', Authorize(0), (req, res) => res.status(200).send(true))
// app.post('/user/decodeToken', Authorize(0), (req, res) => res.status(200).send(req.decoded))
// app.post('/user/checkAuthLevel', Authorize(0), (req, res) => res.status(200).send())

app.get('/admin/getUserList', Authorize(10), GetUserList)
app.post('/admin/setUserRole', Authorize(10), SetUserRole)

app.get('/posts/getPinnedPosts', GetPosts(true))
app.get('/posts/getAllPosts', GetPosts(false))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))