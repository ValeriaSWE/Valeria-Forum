import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    nicknames: [String],
    username: String,
    email: {type: String, required: true, lowercase: true},
    password: {type: String, required: true},
    joinedAt: {type: Date, default: () => Date.now(), immutible: true},
    role: {type: String, default: "none"},
    profilePicture: {
        data: Buffer,
        contentType: String 
    }
})

// module.exports = mongoose.model("User", userSchema)

var User = mongoose.model('User', userSchema);

export default User;