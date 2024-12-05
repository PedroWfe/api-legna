const mongoose = require('mongoose')

const Product = mongoose.model('Product', {
    name: String,
    amount: Number
})

module.exports = Product