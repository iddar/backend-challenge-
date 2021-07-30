const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const USER =  {
  username : process.env.TEST_USERNAME,
  pass : process.env.TEST_PASS
}

const TEST_URI = `mongodb+srv://${USER.username}:${USER.pass}@sandbox.sbxfj.mongodb.net/test_db?retryWrites=true&w=majority`
const TEST_DB = 'test_db'

const MONGODB_URI = process.env.MONGODB_URI  || TEST_URI
const MONGODB_DB = process.env.MONGODB_DB || TEST_DB

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env')
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env')
}

const _db = { server:null, worker:null}
const DEFAULT_TYPE = 'server'

const  DB = {
  async connectToDB(type = DEFAULT_TYPE) {
    
    if(!Object.keys(_db).includes(type)) throw new Error('DB Connection Type error')

    if (_db[type]) {
      console.log('DB type exists')
      return _db[type]
    }

    const client = new MongoClient(MONGODB_URI, { 
      useNewUrlParser: true,  
      useUnifiedTopology: true 
    });
    try { 
      await client.connect();
      console.log(`Successfully connected to ${type.toUpperCase()} MongoDB`)
      _db[type] = client
      return true
    } catch(e) {

      // To ensure relible databse connection
      console.error(`DB Error, Retrying ${type.toUpperCase()} connection`, e.message)
      return new Promise(resolve => setTimeout(()=>resolve(DB.connectToDB(type)),5000));
    }
  },
  async closeDB(type = DEFAULT_TYPE){
    await _db[type].close()
    console.log(`Closing ${type.toUpperCase()} MongoDB Connection`)
    _db[type] = null;
  },
  async getDb(type = DEFAULT_TYPE) {
    //console.log(`Sending ${type.toUpperCase()} MongoDB Connection`)
    return await _db[type].db(MONGODB_DB)
  }
}

module.exports = DB