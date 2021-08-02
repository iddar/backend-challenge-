
let mysql = require('mysql2');

let connection = mysql.createPool({
    host: "mysql",
    user: 'root',
    password: 'password',
    database: "user_service_db"
});

module.exports.connection = connection;

