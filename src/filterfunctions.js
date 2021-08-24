const filters  = {
    friends:(name)=>{
        return  { friends: { $elemMatch: { name: name } } }
    },
    name:(name)=>{
        return  { $or:[{"name.first": name},{"name.last":name}] }
    },
    registeredRange:(dates)=>{
        let [startDate, endDate] = dates.split(",")
      return   {  "registered": { "$gte": new Date(startDate), "$lt": new Date(endDate) } }
    },
  tags:(tags)=>{
            return { "tags": { "$in": tags.split(',') } }
    },
    geoData:(geoData)=>{
        let [lat,long] = geoData.split(',')
      return  {"longitude":long,"latitude":lat}
    }
    
}


module.exports = {filters}