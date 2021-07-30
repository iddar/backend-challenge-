var cron = require('node-cron');
const {updateAll} = require('./lib.js')
const dbo = require("./db.js");

const CONNECTION_TYPE = 'worker'

async function dataUpdate(){
  //Connect to DB of worker type
  try {
    console.log('Setting the db connection at time : ',new Date())
    let status = await dbo.connectToDB(CONNECTION_TYPE)
    
    //console.log('getting the db connection......',status)
    let db = await dbo.getDb(CONNECTION_TYPE)

    console.log('Started Upadting the data......')
    let result = await updateAll(db)
    console.log('Upadting done......')
    
    //Close the connection
    //console.log('Closing the DB connection......')
    await dbo.closeDB(CONNECTION_TYPE)
    console.log('DB connection cloesd at time : ', new Date())
    
    let {matchedCount, modifiedCount, upsertedCount} = result
    
    console.log("Status :")
    if (!modifiedCount && !upsertedCount) {
      console.log("No changes made to the collection.");
    } else {
      console.log(`
        Matched - ${matchedCount} document,\n  
        Modified ${modifiedCount} document, \n 
        Inserted ${upsertedCount} new document`);
    }

  } catch(e) {
    console.log('error',e)
  }
  
  console.log("Task done at time", new Date());
}

// Sterup Task as per need, currently set for every minute just to test
cron.schedule('* * * * *', () =>  {
  console.log('this task rum every minute');
  dataUpdate()
})