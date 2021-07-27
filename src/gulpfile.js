const gulp = require('gulp');
const usersCollection = require('./fetch').usersCollection;
const db = require('./lib/db');
const usersModel = require('./model/users');

async function init() {
  await db.connect();
}

async function end() {
  await db.close();
}

async function gather() {
  const mdl = new usersModel();
  const users = await usersCollection()
  await Promise.all(users.map(u => mdl.save(u)));
}

module.exports = {
  gather: gulp.series([init, gather, end])
};
