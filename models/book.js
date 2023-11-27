const mongoose = require('mongoose')
const path = require('path')

const bookSchema = new mongoose.Schema({
    
  title: {type: String,required: true},
  author: {type: String,required: true,ref: 'Author'},
  summary: { type: String,required: true},
  isbn: {type: String},
  
})

module.exports = mongoose.model('Book', bookSchema)