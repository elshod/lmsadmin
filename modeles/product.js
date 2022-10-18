const {Schema, model} = require('mongoose')

const product = new Schema({
    title: {
        type: String,
        required: true
    },
    price: Number,
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }, 
    time:Number,
    parts:Number,
    text:String,
    modules:[{
        title:String,
        text:String,
        ball:Number,
        lessons:Number,
    }],
    img: String,
    status: {
        type: Number,
        default: 0,
    },
    createdAt:Date
})


module.exports = model('Product',product)