const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb://db";

class DB {
  constructor() {
    this.client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }

  getDB(){
    return this.client.db('db');
  }

  async connect() {
    const result = await this.client.connect();
    return result;
  }

  async close() {
    const result = await this.client.close();
    return result;
  }

  static new() {
    if (!DB.instance) {
      DB.instance = new DB();
    }

    return DB.instance;
  }
};

module.exports = DB.new();
