const express = require('express')
const { usersCollection } = require('./fetch')
const {filters,filterFunction} = require('./filterfunctions')
const redis = require('redis')
const client = redis.createClient({
  host: 'redis',

});
console.log("dsadsad")
const {processRedis,compareDate} = require('./utls')
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
app.get('/users', async (req, res) => {
  console.log(req.query)
  let user = {}
  try {
   let data = await processRedis(client, JSON.stringify(req.query))
   console.log(data)
    if(data){
      user = data
    }else{

      let user_data = await usersCollection()
        user = user_data.filter(single_user =>filterFunction(single_user,req.query)).sort(compareDate)
        if(user.length > 0){

          client.set(JSON.stringify(req.query),JSON.stringify(user))
        }
    }
  }catch(e){
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
      let all_users = await usersCollection()
      user = all_users.filter(single_user => single_user._id === req.params.id)
      if(user.length > 0){

        client.set(req.params.id,JSON.stringify(user[0]))
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
