import express from 'express'
const app = express()   
const port = 8000

import mongoose from 'mongoose'
import cors from 'cors'

import { loginUser, registerUser } from "./controllers/user.js"

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

// app.set('/getUser')

app.listen(port, () => console.log(`Example app listening on port ${port}!`))