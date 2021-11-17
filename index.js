const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
app.use(express.static('build'))
const Product = require('./models/product') //mongo db code
const middleware = require('./utils/middleware')



app.use(express.json())

app.use(cors())

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)

// let products = [
//   {
//       id: 1,
//       name: "A Lap v1",
//       description: "Smooth and lightweight laptop perfect for WFH",
//       price: 200,
//       quantity: 122
//     },
//     {
//       id: 2,
//       name: "XY Lap v2",
//       description: "another Smooth and lightweight laptop perfect for WFH",
//       price: 203,
//       quantity: 124
//     },
//     {
//       name: "CD Lap v3 ",
//       description: "yet another Smooth and lightweight laptop perfect for WFH",
//       price: 204,
//       quantity: 121,
//       id: 3
//     },
//     {
//       id: 4,
//       name: "FG Lap v4",
//       description: "the only Smooth and lightweight laptop perfect for WFH",
//       price: 205,
//       quantity: 122
//     },
// ]

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/products', (req, response) => {
  Product.find({}).then(notes => {
    // console.log("notes: ",notes)
    response.json(notes)
  })
})

const generateId = async () => {
  const products = await Product.find({})
  // console.log("products: ",products)

  const maxId = products.length > 0
    ? Math.max(...products.map(n => Number(n.id))) //not onverting to number causes some validation error
    : 0
  console.log("maxID: ",maxId+1)
  return maxId + 1
}

// console.log("generating id: ",generateId())

app.post('/api/products', async (request, response) => {
  const body = request.body

  if (!body.name || !body.description) {
    return response.status(400).json({ 
      error: 'name or description missing' 
    })
  }

  // const product = {
  //   id: await generateId(), 
  //   name: body.name,
  //   description: body.description,
  //   price: body.price,
  //   quantity: body.quantity,
   
  // }

  const mongoproduct = new Product({
    id: await generateId(), //generateId() is an async function because it makes db calls. so we have to use await
    name: body.name,
    description: body.description,
    price: body.price,
    quantity: body.quantity,
   
  })

  // products = products.concat(product)

  mongoproduct.save().then(savedProduct => {
    console.log("product saved in DB")
    console.log("product: ",savedProduct)
    response.json(savedProduct)

  })

  
})

app.get('/api/products/:id', async (request, response) => {
  const id = Number(request.params.id)
  const product = await Product.findOne({"id": id})
  // console.log("product :", product)

  
  // const product = products.find(product => product.id === id)

  if (product) {
    response.json(product)
    // console.log("product:",product)
    // console.log("name: ",product.name)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/products/:id', async (request, response) => {
  const id = Number(request.params.id)
  var product = await Product.findOne({"id": id})
  // product = JSON.stringify(product)
  console.log("product: ",product)
  console.log("product._ID: ",product._id)
  await Product.findByIdAndRemove(product._id)


  // products = products.filter(product => product.id !== id)

  response.status(204).end()
})

app.put('/api/products/:id', async (request, response) => {
  
  const id = Number(request.params.id)
  var product = await Product.findOne({"id": id})
  const body = request.body

  const mongoproduct = {
    id: id,
    name: body.name,
    description: body.description,
    price: body.price,
    quantity: body.quantity,
   
  }

  // const editedproduct = {
  //   id: id,
  //   name: body.name,
  //   description: body.description,
  //   price: body.price,
  //   quantity: body.quantity,
   
  // }
  // products = products.map(product => product.id !== id ? product : editedproduct)

  const updatedproduct = await Product.findByIdAndUpdate(product._id, mongoproduct, { new: true })
  
  response.json(updatedproduct)

})


app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

const PORT = process.env.PORT || 3002 //process.env.port is for heroku to get its port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})