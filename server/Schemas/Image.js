import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema({
    data: { type: Buffer, required: true }, 
    contentType: { type: String, required: true }
})

// * Uplading Images:
// * https://www.youtube.com/watch?v=GyzC-30Bqfc&t=648s

const Image = mongoose.model('Image', imageSchema);

export default Image;