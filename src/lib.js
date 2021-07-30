const dbo = require("./db.js");
const { usersCollection } = require('./fetch')

//To avoid any Typos (spell mistakes)
const COLLECTION = { USER:'users' }

async function initialSetup() {
  try {
    const db = await dbo.getDb()
    await db.createCollection(COLLECTION.USER);

    const indexes = [
      { "registeredAt": 1},
      { "latitude": 1, "longitude": 1},
      { "friends.name": 1 },
      { "tags": 1 },
      { "eyeColor": 1 },
      { "geozone": "2dsphere" }
    ]
    const userCollection = await db.collection(COLLECTION.USER)

    indexes.forEach(async (index) => {
      await userCollection.createIndex(index)
    })
    //await users.createIndexes(indexes)   // for advance Atlas Tiers

    console.log('Initial setup completed')

  } catch(e) {
    console.log('If you already run the server before then ignore the error \nas your database might already created "',COLLECTION.USER,'" collection')
    console.log('Error Occured', e.massage)
  }
}

async function updateOrRelpaceOne(db, newdata){
  if(!db) db = await dbo.getDb()
  const userCollection = await db.collection(COLLECTION.USER);
  const result = await userCollection.replaceOne({  _id:newdata._id }, newdata, { upsert:true });
  return result;
}

async function updateAll(db) {
    const usersAlldata = await usersCollection()

    let matchedCount = 0, modifiedCount=0, upsertedCount = 0;
    
    await Promise.all(usersAlldata.map(async (oneUserData) => {
        
      let {registered,longitude,latitude} = oneUserData

      let extraData = {
        "registeredAt": new Date(registered),
        "geozone": {
          "type": "Point", "coordinates": [parseFloat(longitude), parseFloat(latitude)]
        }
      }

      oneUserData = {...oneUserData,...extraData}
       
      let result =  await updateOrRelpaceOne(db, oneUserData)
        matchedCount += result.matchedCount
        modifiedCount += result.modifiedCount
        upsertedCount += result.upsertedCount
    }))

  return {matchedCount,modifiedCount,upsertedCount}
}

const filterResolver = {
    id(id){
      return {"_id" : id}
    },
    eyecolor(color){
      return {"eyeColor" : color} 
    },
    friends(friend){
      return {"friends.name" : { $regex: friend, $options:'i' }}
    },
    latitude(lat){
      return {"latitude" : lat} //parseFloat(lat)
    },
    longitude(lon){
      return {"longitude" : lon} //parseFloat(lon)
    },
    geozone(points){
      //Limit to max 2 points XY
      points = points.split(',',2)

      return {"geozone": { 
        "$near": { 
          "$geometry": { 
              index: "Point",
              coordinates: points.map(point => parseFloat(point)) 
            }, 
            "$minDistance": 5000000,
            "$maxDistance": 8000000 
          } 
        }
      }
    },
    registered:(date) =>{
      //date = {start : "Monday, June 22, 2015 2:13 AM",end:"Monday, June 22, 2015 2:13 AM"}
      let [start,end] = date.split('-',2)
      
      start=start.trim()
      end=end.trim()

      console.log(start,end)
      let query = {}
      try {
        if(start) {
          start = new Date(start)
          query = {"$gte" : start}
        }

        if(end && (new Date(start) < new Date(end))){
          end = new Date(end)
          query = {...query, "$lte" : end}
        }

      } catch(e) {
        console.log('ERROR : date not valid')
        return
      }

      return { "registeredAt" :  query }
    },
    tags:(tags) => {
      //tags = ["amet","duis"]
      tags = tags.split(',',100)
      return {
        "tags":{"$all":tags.map(tag => tag.trim())}
      }
    }
  }

  //If needed to send any specific date format as result
  function dateFormater(date){
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',hour:'numeric',minute:'numeric' }
        date  = new Date(date)
    return date.toLocaleDateString("en-US", options).replace(/(^.+),/,'$1')
  }

module.exports = {filterResolver,COLLECTION,updateAll,initialSetup,updateAll}