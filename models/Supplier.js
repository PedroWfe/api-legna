const mongoose = require('mongoose')

const Supplier = mongoose.model('Supplier', {
    name: String
})

module.exports = Supplier