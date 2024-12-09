const mongoose = require('mongoose')

const Entry = mongoose.model('Entry', {
    date: Date,
    supplierId: String,
    productName: String,
    productAmount: Number,
    productValue: Number,
    author: String
})

module.exports = Entry  