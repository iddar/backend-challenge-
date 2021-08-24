const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    _id:mongoose.SchemaTypes.ObjectId,
    index: Number,
    guid: String,
    isActive: Boolean,
    balance: String,
    picture: String,
    age: Number,
    eyeColor: {type:String,enum:['blue','brown','green']}, // one of ("blue", "brown", "green")
    name: new mongoose.Schema({
      first: String,
      last: String
    }),
    company: String,
    email: String,
    phone: String,
    address: String,
    about: String,
    registered: Date,
    latitude: String,
    longitude: String,
    tags: Array, // dynamic dic
    range: Array,
    friends: Array,
    greeting: String,
    favoriteFruit:{type:String,enum:['apple','banana','strawberry']}, // one of ('apple', 'banana', 'strawberry')
})

module.exports = mongoose.model('User',UserSchema)