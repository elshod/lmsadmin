const {Schema, model} = require('mongoose')

const order = new Schema({
    product:{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    name: String,
    phone: String,
    type:{
        type:Number,
        default:0,
    },
    email:String,
    comment:String,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    status: {
        type: Number,
        default: 0
    }
})


module.exports = model('Order',order)