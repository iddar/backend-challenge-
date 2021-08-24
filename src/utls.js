const moment = require('moment')
const processRedis = (client,id) =>new Promise((resolve,reject)=>{
    client.get(id,(err,value) =>{
        if(value){

            resolve(JSON.parse(value))
        }else{

            resolve(null)
        }
    })
})
function compareDate(a, b) { 
      var momentA = moment(new Date(a.registered));
      var momentB = moment(new Date(b.registered));
      if (momentA > momentB) return 1;
      else if (momentA < momentB) return -1;
      else return 0;
    
  }


module.exports = {processRedis,compareDate}