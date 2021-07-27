const express = require('express')
const usersModel = require('./model/users');
const db = require('./lib/db');

const app = express()
const port = process.env.NODE_ENV === 'test' ? 3001 : 3000

app.get('/', async (req, res) => {
  res.json({
    status: 'Ok!'
  })
})

app.get('/users', async (req, res) => {
  const filterNames = ['id', 'eyeColor', 'latitude', 'longitude', 'friends', 'registered', 'tags', 'geozone'];
  const filters = Object.entries(req.query).filter(([k]) => filterNames.includes(k));
  const mdl = new usersModel();
  const results = await mdl.find(mdl.filterQuery(filters));

  res.setHeader('Content-Type', 'application/json');
  res.json(results);
})

app.get('/users/:id', async (req, res) => {
  const mdl = new usersModel();
  const results = await mdl.find({_id: req.params.id});

  res.setHeader('Content-Type', 'application/json');
  res.json(results && results[0]);
})

async function start() {
  await db.connect();

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  });
}

process.on('SIGTERM', () => {
  db.connect();
  server.close(async () => {
    console.log('Process terminated')
  })
})

start();

module.exports = app
