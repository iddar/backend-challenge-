const express = require("express");
const { usersCollection } = require("./fetch");

let mysql = require("mysql2");

const app = express();
const port = process.env.NODE_ENV === "test" ? 3001 : 3000;

// middleware
// For parsing application/json - https://www.geeksforgeeks.org/express-js-req-body-property/
app.use(express.json());

let connection;

app.get("/", async (req, res) => {
  res.json({
    status: "Ok!",
  });
});

app.get("/users", async (req, res) => {
  const users = await usersCollection();
  // UserIDs (UserID int, UserInfoID int, PRIMARY KEY (UserID), FOREIGN KEY (UserInfoID) REFERENCES UserInfo (UserInfoID)),
  // UserInfo (UserInfoID int, UserID int, PRIMARY KEY (UserInfoID), FOREIGN KEY (UserID) REFERENCES UserIDs (UserID));`,
  // SELECT COUNT(*)
  //   FROM information_schema.tables
  //   WHERE table_schema = 'user_service_db'
  //   AND table_name = 'UserIDs' AND table_name = 'UserInfo';

  // https://stackoverflow.com/questions/52377469/failed-to-open-the-referenced-table this references a chiken and egg problem where both tables reference each other without being created causing circular problems

  // connection.query("USE user_service_db;");

  connection.query(
    `SELECT COUNT(*)
   FROM information_schema.tables
   WHERE table_schema = 'user_service_db'
   AND table_name = 'UserIDs' OR table_name = 'UserInfo';`,
    (err, results) => {
      if (err) {
        console.log(err);
      }

      // connection.query(`SELECT * FROM UserIDs`, (err, results) => {

      // })

      console.log(results);
      if (results[0]["COUNT(*)"] === 1) {
        // checks to see if only one table (users id ) is up if it is then it drops it

        connection.query(
          `DROP TABLE IF EXISTS UserIDs, UserInfo;`,
          (err, results) => {
            if (err) {
              console.log(err);
            }

            console.log("dropped UserIDs and UserInfo");
          }
        );
      }

      if (results[0]["COUNT(*)"] === 0) {
        // if no tables created then it will get created
        connection.query(
          `CREATE TABLE UserIDs( UserID int, UserInfoID int, PRIMARY KEY (UserID));`,
          (err, results) => {
            if (err) {
              console.log(err);
            }

            console.log(results, "Created Table UserIDs");
          }
        );

        connection.query(
          `CREATE TABLE UserInfo(UserInfoID int, UserInfoJSON BLOB, FOREIGN KEY (UserInfoID) references UserIDs(UserID), PRIMARY KEY (UserInfoID));`,
          (err, results) => {
            if (err) {
              console.log(err);
            }

            console.log(results, "Created Table UserInfo");
          }
        );

        connection.query(
          `alter table UserIDs add foreign key (UserInfoID) references UserInfo(UserInfoID);`,
          (err, results) => {
            if (err) {
              console.log(err);
            }
            console.log(results, "Altered tables");

            connection.query(`SHOW TABLES;`, (err, results) => {
              console.log(results); //shows tables in db

              let mainTables = 0;

              for (let i = 0; i < results.length; i++) {
                if (
                  results["Tables_in_user_service_db"] === "UserIDs" ||
                  results["Tables_in_user_service_db"] === "UserInfo"
                ) {
                  mainTables += 1;
                }
              }

              if (mainTables === 2) {
                //start inserting the data from users

                const sqlUserID = `INSERT INTO UserIDs (UserID) VALUES ?`;

                const sqlUserInfo = `INSERT INTO UserInfo (UserInfoID, UserInfoJSON) VALUES ?`;

                const userIDsArr = [];

                const userData = [];

                for (let i = 0; i < users.length; i++) {
                  userIDsArr.push([users[i]["_id"]]);
                  userData.push([[users[i]["_id"]], JSON.stringify(users[i])]);
                }
                // one problem is millions of records need to be inserted, this becomes a problem on first load but if continuous load and continous adding new users and updating their data then it would mitigate the problem

                connection.query(sqlUserID, [userIDsArr], (err, result) => {
                  if (err) {
                    console.log(err);
                  }
                  console.log("Added USER IDs");
                });
                connection.query(sqlUserInfo, [userData], (err, result) => {
                  if (err) {
                    console.log(err);
                  }
                  console.log("Added USER INFO");
                });
              }
            });
          }
        );
      }
    }
  );

  console.log("users endpoint");
  res.json(users);
});

app.get("/users/:id", async (req, res) => {
  const users = await usersCollection();

  const { id } = req.params; // grab id from params

  const UserIDsTableName = `UserIDs`;

  const UserIDsColumnName = "ID";

  const CheckTableExists = `SELECT *
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = '${UserIDsTableName}'`;

  connection.query(CheckTableExists, (err, results) => {
    if (err) {
      console.log(err);
    }

    if (results.length === 0) {
      // create table and insert everyone in the table and so on and so forth then send the specific user from the table
    }

    // if table is already made users are already saved in database pull the certain user and their info from the db

    const FindSpecificUserQuery = "";

    connection.query(FindSpecificUserQuery, (err, results) => {
      if (err) {
        console.log(err);
      }
      console.log(results);
    });
  });

  res.json(users[25]);
});

app.listen(port, () => {
  connection = mysql.createPool({
    host: "mysql",
    user: "root",
    password: "password",
  });

  connection.query("USE user_service_db;");

  console.log(`Example app listening at http://localhost:${port}`);
});

/* 
 The way I would have accomplished this is if i used mongodb to just insert everything into the database and then update the id with the new values if that was the case
 but i opted to use mysql since the job desc uses a postgres sql hence the mysql

 experience with this project - very new to docker and somehow managed to finaly understand that docker has container has to be at the same port as the node.js port which is defaulted to 3306
 still a bit shaky with that but got it to work after pulling my hair out

 next thing planning out how to add all the values to multiple or one table! 

 I decided to take a nonsql approach and looking if this was frowned uppon - i since found facebook uses a similar approach with mysql as well
  mysql provides a unique way to store huge nested key value pairs! 

  Decided to just json everything and pick out the ids from one table and hook it up to the another table containing thier information and parse it when someone hits "/users/:id" this end point 
  basicaly serializing data and deserializing when a user hits an endpoint making the object easy to access values and presenting it to the user

  Also was going to add a layer or redis to ignore querying too offten and giving a performance boost to the server!


  struggles - 
  docker / docker-compose set up to connect to node.js ports 
  a connection issue with mysql causing 2 handshakes and a whole bunch of errs i put the link in one of the early commits
  not being able to bundle my querys into one to make querying faster and with less trips thats something im super eager to get
  the thought about not using mysql as its intended and serializing objects not sure if frowned or not frowned uppon

  Very good project overall and I feel as if I would be cheating if I just used mongodb and not learned more about sql language and mysql as a whole!
*/

module.exports = app;
