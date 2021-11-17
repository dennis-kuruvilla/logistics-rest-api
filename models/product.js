const mongoose = require('mongoose')
require('dotenv').config();

const url = process.env.MONGODB_URI
console.log('connecting to', url)
console.log('--------------------')

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)

  })

  //transform the objects returnd from db into string and delete unwanted fields
const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  description: String,
  price: Number,
  quantity: Number
})

productSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.objId = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Product', productSchema)