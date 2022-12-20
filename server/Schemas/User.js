import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    nicknames: [String],
    username: {type: String, required: true},
    email: {type: String, required: true, lowercase: true},
    password: {type: String, required: true},
    joinedAt: {type: Date, default: () => Date.now(), immutible: true},
    role: {type: String, default: "pleb"},
    roleRank: {type: Number, default: 0},
    profilePicture: {type: mongoose.Schema.Types.ObjectId, ref: "Image", default: "63809edd3bd4a213d4aa8492" /*"6335abe12ff7b5bff877f976"*/},
    numberOfPosts: {type: Number, default: 0},
    numberOfComments: {type: Number, default: 0},
    about: {type: String, default: 'Om mig.'}
})

var User = mongoose.model('User', userSchema);

export default User;