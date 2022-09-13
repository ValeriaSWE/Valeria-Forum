const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    nicknames: [String],
    username: String,
    password: String,
    joinedAt: Date,
    role: String,
})

module.exports = mongoose.model("User", userSchema)