# Implementation

This branch of this project is Implemented is without any kind of database.  

## URLs

The project has two urls.

- `/users/:id`
  - The above mentioned URL is a get request with user id being passed as a param

- `/users?filter=value`
  - This url is a POST request with data bing passed as query .
    - Eg: `http://localhost:3000/users?name=Young&registeredRange=2015-08-01T13:45:00.000Z,2018-03-16T09:47:00.000Z&geoData=37.916119,-127.161348&tags=ut,dolor, labore&email=young.velazquez@scenty.us&favoriteFruit=strawberry`
    - For Friends /users?friends="..."
    - For Tags /users?tags="tag1,tag2..."
    - For Users by Registered Date Range /users?registeredRange=2015-08-01T13:45:00.000Z,2018-03-16T09:47:00.000Z
    - For filtering by Geo Data /users?geoData="latitude,longitude"
    - For everything else /users?PropertyName:PropertyValue

### Sample data

```js
[{
  "_id": "5f7e0c4bc17a34141a957b59",
  "index": 0,
  "guid": "8e4ba647-a4da-4d45-b92a-6d9230484227",
  "isActive": false,
  "balance": "$2,648.30",
  "picture": "http://placehold.it/32x32",
  "age": 23,
  "eyeColor": "blue", // one of ("blue", "brown", "green")
  "name": {
    "first": "Roslyn",
    "last": "Pickett"
  },
  "company": "EWAVES",
  "email": "roslyn.pickett@ewaves.me",
  "phone": "+1 (856) 400-3165",
  "address": "479 Sumner Place, Vowinckel, Puerto Rico, 4398",
  "about": "Mollit eu voluptate qui do duis elit officia anim.",
  "registered": "Friday, July 24, 2015 8:18 PM",
  "latitude": "-28.502876",
  "longitude": "-64.265012",
  "tags": [ "irure", "est", "aute", "cillum", "dolore" ], // dynamic dic
  "range": [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
  "friends": [
    { "id": 0, "name": "Sandoval Sawyer" },
    { "id": 1, "name": "Bernadine Bass" },
    { "id": 2, "name": "Bobbie Lee" }
  ],
  "greeting": "Hello, Roslyn! You have 9 unread messages.",
  "favoriteFruit": "strawberry" // one of ('apple', 'banana', 'strawberry')
}]
```

### Run enviroment

```sh
# before to start make a fork
git clone https://github.com/{{githubuser}}/backend-challenge
cd backend-challenge
docker-compose build
docker-compose up

# To run test
docker ps # To show id of containers `backend-challenge_src`
docker exec -it container_id bash
npm run test
```
