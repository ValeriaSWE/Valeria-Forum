import mongoose from 'mongoose'

const tagSchema = new mongoose.Schema({
    name: { type: String, required: true },
    color: { type: String, default: "var(--color-white-l)" }
})

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;