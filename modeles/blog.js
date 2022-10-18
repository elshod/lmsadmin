const {Schema, model} = require('mongoose')

const blog = new Schema({
    title: String,
    status: {
        type: Number,
        default: 1,
    },
    type: Number,
    text: String,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    img: String
})


module.exports = model('Blog',blog)