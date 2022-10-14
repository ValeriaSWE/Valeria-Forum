import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    nicknames: [String],
    username: String,
    email: {type: String, required: true, lowercase: true},
    password: {type: String, required: true},
    joinedAt: {type: Date, default: () => Date.now(), immutible: true},
    role: {type: String, default: "pleb"},
    roleRank: {type: Number, default: 0},
    profilePicture: {type: mongoose.Schema.Types.ObjectId, ref: "Image", default: "6335abe12ff7b5bff877f976"}// { data: Buffer, contentType: String }
})

var User = mongoose.model('User', userSchema);

export default User;