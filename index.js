const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload')
const fs = require('fs-extra')
require('dotenv').config()

// This is your real test secret API key.
const stripe = require("stripe")("sk_test_51IeuuaFz4lVH0YokWAp1VJtNSWRqJN28Tr3kVbAUHtVHcUjPqMvTUrPSsyD16UuME7skvcEb0OBmMPjz10Z165st00qe1JVBqt");

const app = express()
const port = 4000



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cors())

app.use(express.static('experience'))
app.use(fileUpload());


// const calculateOrderAmount = items => {
//   // Replace this constant with a calculation of the order's amount
//   // Calculate the order total on the server to prevent
//   // people from directly manipulating the amount on the client
//   return 1400;
// };



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6i5ol.mongodb.net/aircnc?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const experienceCollection = client.db("aircnc").collection("experience");
  const homesCollection = client.db("aircnc").collection("homes");
  const hotelCollection = client.db("aircnc").collection("hotel");
  // perform actions on the collection object

  //find all hotelCollection

  app.get('/findHotel' , (req, res)=>{
    hotelCollection.find({})
    .toArray((err, documents)=>{
      res.send(documents)
    })
  })

  ////add all hotel in mongo db database

  app.post('/addHotel' , (req, res)=>{
    const file = req.files.file;
    const title = req.body.title;
    const cost = req.body.cost;
    const star = req.body.star;
    const filePath = `${__dirname}/experience/${file.name}`
    file.mv(filePath, err => {
      if(err){
        res.status(500).send({msg:'Failed to upload Image'})
      }
      const newImg = fs.readFileSync(filePath)
      const encImg = newImg.toString('base64')
      const image = {
        contentType:req.files.file.mimetype,
        size:req.files.file.size,
        img: new Buffer.from(encImg, 'base64')
      }
      hotelCollection.insertOne({image, title, cost, star})
      .then(result => {
        fs.remove(filePath, err => {
         if(err){
          res.status(500).send({msg:'Failed to upload Image'})
         }
         res.send(result.insertedCount > 0)
        })
      })

    })
  })

  //find all homesCollection
  app.get('/findHomes', (req, res)=>{
    homesCollection.find({})
    .toArray((err, documents)=>{
      res.send(documents)
    })
  })

  //upload all homes
  app.post('/homeImage', (req, res)=>{
    const file = req.files.file;
    const title = req.body.title;
    const details = req.body.details;
    const cost = req.body.cost;
    const star = req.body.star;
    const filePath = `${__dirname}/experience/${file.name}`;
    file.mv(filePath, err =>{
      if(err){
        res.status(500).send({msg:'Failed to upload Image'});
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64')
      const image = {
        contentType:req.files.file.mimetype,
        size:req.files.file.size,
        img: new Buffer.from(encImg, 'base64')
      }
      homesCollection.insertOne({image, title, details, cost, star})
      .then(result => {
        fs.remove(filePath, err => {
          if(err){
            res.status(500).send({msg:'Failed to upload Image'})
          }
          res.send(result.insertedCount > 0)
        })
      })
    })
  })

  

  // find all experience and show client side
  app.get('/findExperience', (req, res)=>{
    experienceCollection.find({})
    .toArray((err, documents)=>{
      res.send(documents)
    })
  })


  //experience added in mongodb
 app.post('/addExperience', (req, res)=>{
     const file = req.files.file;
     const title = req.body.title;
     const details = req.body.details;
     const cost = req.body.cost;
     const star = req.body.star;
     const filePath = `${__dirname}/experience/${file.name}`;
     file.mv(filePath, err =>{
      if(err){
        
        res.status(500).send({msg:'Failed to upload Image'});
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');
      
      const image = {
      
        
        contentType:req.files.file.mimetype,
        size:req.files.file.size,
        img: new Buffer.from(encImg, 'base64')
      }
      experienceCollection.insertOne({image, title, details, cost, star})
      .then(result =>{
        fs.remove(filePath, err => {
          if(err){
            
            res.status(500).send({msg:'Failed to upload Image'});
          }
          res.send(result.insertedCount > 0)
        })
      })
      
    })
    
 })


});
app.post("/create-payment-intent", async (req, res) => {
  const { total } = req.body;
  // console.log(total)
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: "usd"
  });
  res.send({
    clientSecret: paymentIntent.client_secret
  });
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port)