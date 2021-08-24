const express = require('express')
const { usersCollection } = require('./fetch')
const mongoose = require('mongoose')
const redis = require('redis')
const client = redis.createClient({
  host: 'redis',

});
const {filters} = require('./filterfunctions');
mongoose.connect("mongodb://root:example@mongo:27017/test", { authSource: 'admin', useNewUrlParser: true, useUnifiedTopology: true })
const { processRedis, compareDate } = require('./utls')
const User = require('./User')
const app = express()
const port = process.env.NODE_ENV === 'test' ? 3001 : 3000
client.on("error", function (error) {
  console.error(error);
});
app.get('/', async (req, res) => {
  res.json({
    status: 'Ok!'
  })
})
// usersCollection().then(data =>{
//   User.insertMany(data, (err, response) => {
//     console.log(err, response)
//   })
// })

app.get('/users', async (req, res) => {
  console.log(req.query)
  let user = {}
  try {
    let data = await processRedis(client, JSON.stringify(req.query))
    console.log(data)
    if (data) {
      user = data
    } else {
      let Object_value = {}
      Object.keys(req.query).map(single_element => {
        if(filters[single_element]){

          Object_value = {
            ...Object_value,...filters[single_element](req.query[single_element])
          }
        }
        else {
          Object_value = { ...Object_value, [single_element]: req.query[single_element] }
        }
      })
      console.log(Object_value)
      user = await User.find(Object_value)
      user = user.sort(compareDate)
      if (user.length > 0) {

        client.set(JSON.stringify(req.query), JSON.stringify(user))
      }
    }
  } catch (e) {
    console.log("Error", e);
    res.status(401).json({
      message: "error"
    })
  } finally {
    res.status(200)
    res.send(user)

  }
})

app.get('/users/:id', async (req, res) => {
  let user = {}
  try {
    let data = await processRedis(client, req.params.id)
    if (data) {
      user = data
    } else {
      user = await User.findById(req.params.id).exec();

      if (user) {

        client.set(req.params.id, JSON.stringify(user))
      }
    }
  } catch (e) {
    console.log("Error", e);
    res.status(401).json({
      message: "error"
    })
  } finally {
    res.status(200).json(user)
  }



})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

module.exports = app
