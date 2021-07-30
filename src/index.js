const express = require('express')
const {filterResolver,initialSetup,COLLECTION} = require('./lib.js')
const dbo = require("./db.js");

require('dotenv').config()

const app = express()
const port = process.env.NODE_ENV === 'test' ? 3001 : 3000

app.get('/', async (req, res) => {
  res.json({
    status: 'Ok!'
  })
})

app.get('/users', async (req, res) => {
  
  //#Filtering
  const filterKeys = Object.keys(filterResolver);
  
  let filters = Object.entries(req.query).map(val => {
        val[0] = val[0].toLowerCase().trim()
        //console.log("val",val)
        return val
      })
      .filter(([key]) => {
        return filterKeys.includes(key)
      });
  
  //console.log('filters === ',filters)
  
  let filterObj = {}
  filters = Object.entries(filters).map(([i,data])=>{
          let [key,value] = data
          //console.log('data',data)
          return filterResolver[key](value.trim())
        })

  //console.log('filters',filters)
  
  filters.forEach(obj => {
    filterObj = {...filterObj,...obj}
  })
  
  //console.log("\nFinal filterObj :  ",filterObj)

  //#Sorting date order
  let sortBy = -1
  if(req.query.sortDate){
    sortBy= req.query.sortDate.toLowerCase()==='asc'? 1:-1
  }
  
  //#Querying with final filterObj
  let results;
  try {
    let db = await dbo.getDb();
    let userCollecton = db.collection(COLLECTION.USER)

    results = await userCollecton.find(filterObj, {projection:{"geozone": 0,'registeredAt':0}}).sort({ "registeredAt" : sortBy}).toArray()
    //console.log(results)
    
    if(!results.length) {
      results = {
        status: 'No Data match or found !'
      }
    }
  } catch(e) {
    results = {
      status: 'Network error, Please try again later!'
    }
  }

  res.json(results)
})


app.get('/users/:id', async (req, res) => {
  let result;
  try {
    let db = await dbo.getDb();
    let userCollecton = db.collection(COLLECTION.USER)

    result = await userCollecton.find({"_id" : req.params.id}, {projection : {"geozone": 0,'registeredAt':0}}).toArray()

    if(!result.length) {
      result = {
        status: 'Invalid User !'
      }
    } else {
      result = result[0]
    }

  } catch(e){
    console.log('error',e)
    result = {
      status: 'Network error, Please try again later!'
    }
  }

  res.json(result)
})

app.listen(port,async () => {
  await dbo.connectToDB()
  initialSetup()
  console.log(`Example app listening at http://localhost:${port}`)
})

module.exports = app