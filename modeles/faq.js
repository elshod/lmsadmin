const {Schema, model} = require('mongoose')

const Faq = new Schema({
    question: String,
    answer:String,
    status: Number,
    createdAt: Date,
})

module.exports = model('Faq',Faq)