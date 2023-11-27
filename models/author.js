const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
  first_name: { type: String , required: true },
  family_name: { type: String , required: true },
  date_of_birth: { type: Date , required: true },
  date_of_death: { type: Date},
  name: { type: String , required: true }
})

module.exports = mongoose.model('Author', authorSchema)