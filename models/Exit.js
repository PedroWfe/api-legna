const mongoose = require('mongoose')

const Exit = mongoose.model('Exit', {
    date: Date,
    materialName: String,
    quantity: Number,
    author: String,
})

module.exports = Exit