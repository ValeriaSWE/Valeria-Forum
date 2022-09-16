const express = require('express')
const app = express()   
const port = 8000

const mongoose = require('mongoose')

app.use(express.json())
// app.get('/', (req, res) => res.send('Hello World!'))


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


app.get('/getUser', (req, res) => {
    // console.log(req.headers)
    // res.append("hello", "world")
    // res.type('application/json')
    res.json({hello: "world"})
})

// app.set('/getUser')

app.listen(port, () => console.log(`Example app listening on port ${port}!`))