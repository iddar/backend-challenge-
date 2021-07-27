db = db.getSiblingDB('db');
db.createCollection('users');
db.users.createIndex({ "filters.registered": 1, latitude: 1, longitude: 1 });
db.users.createIndex({ "friends.name": 1 });
db.users.createIndex({ tags: 1 });
db.users.createIndex({ "filters.geozone": "2dsphere" });
