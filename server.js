// import express from "express";
// import data from "./data.json";

const express = require("express");
const data = require("./data.json");
const users = require("./users.json");
const jwt = require("jsonwebtoken");
const base64 = require("base64url");
const MongoClient = require("mongodb").MongoClient;
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const util = require("util");
const path = require("path");
const { connect } = require("http2");
const { Pool, Client } = require("pg");
const { json } = require("body-parser");
const ConService = require("./PGmodule/db");
const { decode } = require("punycode");

// pool.query(
//   "INSERT INTO users(id,firstName,lastName,email,password) VALUES($1,$2,$3,$4,$5) RETURNING *",
//   ["2", "Raj", "vel", "a", "a"],
//   (err, res) => {
//     //console.log(res.rows);
//     if (err) {
//       console.log(err.stack);
//     } else {
//       console.log(res.rows[0]);
//       // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
//     }
//     console.log("DOne");
//     pool.end();
//   }
// );

// const ulist = users;
// console.log(ulist);

// for (var i in ulist) {
//   console.log(ulist[i]);
//   const query =
//     "INSERT INTO users(id,firstName,lastName,email,password) VALUES($1, $2,$3,$4,$5) RETURNING*";
//   const values = [
//     ulist[i].id,
//     ulist[i].firstName,
//     ulist[i].lastName,
//     ulist[i].email,
//     ulist[i].password,
//   ];

//   console.log(values);
//   pool.query(query, values, (err, res) => {
//     console.log("DOne");
//     if (err) {
//       console.log(err.stack);
//     } else {
//       console.log(res.rows[0]);
//       // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
//     }
//     // pool.end();
//   });
// }

// const ulist = data;
// console.log(ulist);

// for (var i in ulist) {
//   console.log(ulist[i]);
//   const query = "INSERT INTO data(owner,message) VALUES($1, $2) RETURNING*";
//   const values = [ulist[i].owner, ulist[i].test];

//   console.log(values);
//   pool.query(query, values, (err, res) => {
//     console.log("DOne");
//     if (err) {
//       console.log(err.stack);
//     } else {
//       console.log(res.rows[0]);
//       // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
//     }
//     // pool.end();
//   });
// }

const writeFile = util.promisify(fs.writeFile);

const app = express();
const port = process.env.PORT || 3000;

const conService = new ConService();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,Authorization"
  );
  next();
});

//const msgs = data;
//console.log(msgs);
const userslist = users;
//const users = userlist;
//const ndata = [];

const auth = express.Router();

app.get("/", (req, res) => {
  res.send("dhajhdjashdj");
});

app.get("/messages", async (req, res) => {
  const msgs = await conService.getMessages();
  console.log("test");
  console.log(msgs);
  res.send(msgs);
});

app.get("/messages/:user", async (req, res) => {
  var user = req.params.user;
  const msgs = await conService.getMessagesbyUser(user);
  res.send(msgs);
});

app.post("/message", async (req, res) => {
  console.log("starting...");
  const msg = await conService.postMessages(req.body);
  res.send(req.body);
});

app.post("/decode", async (req, res) => {
  console.log("starting...");
  const headerInBase64UrlFormat = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
  const signInBase64UrlFormat = "csGpnYpRhasUVNr4yd7keThJ1votpF7P1WEKAtcw4CY";
  const decodedheader = base64.decode(headerInBase64UrlFormat);
  const decodedSign = base64.decode(signInBase64UrlFormat);
  var t = jwt.verify(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Ik1vYmlsZU51bWJlciI6IjgwNTY1NjAwNzUiLCJSb2xlIjoiQXBwbGljYW50In0sImlhdCI6MTU5NzY3MTU4NCwiZXhwIjoxNTk3NjcyNzg0fQ.csGpnYpRhasUVNr4yd7keThJ1votpF7P1WEKAtcw4CY",
    "",
    "HS256"
  );
  var d = jwt.decode(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Ik1vYmlsZU51bWJlciI6IjgwNTY1NjAwNzUiLCJSb2xlIjoiQXBwbGljYW50In0sImlhdCI6MTU5NzY3MTU4NCwiZXhwIjoxNTk3NjcyNzg0fQ.csGpnYpRhasUVNr4yd7keThJ1votpF7P1WEKAtcw4CY"
  );
  // const msg = await conService.postMessages(req.body);
  console.log(t);
  console.log(d);
  //console.log(decodedheader, decodedSign);
  //res.send(decodedheader);
  res.send(decodedSign);
});

app.get("/users/me", checAuth, (req, res) => {
  console.log(req.user);
  res.json(userslist[req.user]);
});

app.post("/users/me", checAuth, (req, res) => {
  var user = userslist[req.user];
  console.log(req.user);

  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  res.json(user);
});
app.post("/register", (req, res) => {
  // console.log(req.body);
  const udata = userslist;
  console.log(req.body);
  var index = udata.push(req.body) - 1;
  console.log(index);
  var tt = udata[index];
  console.log(tt);
  tt.id = index;
  console.log(tt);
  fs.writeFileSync(path.join(__dirname, "users.json"), JSON.stringify(udata));

  sendToken(tt, res);
});

app.post("/login", (req, res) => {
  // console.log(req.body);
  const udata = userslist;
  var user = udata.find((user) => user.email == req.body.email);
  console.log(user);
  if (!user) sendAuthError(res);
  if (user.password == req.body.password) {
    sendToken(user, res);
  } else {
    sendAuthError(res);
  }
});

function sendToken(user, res) {
  var token = jwt.sign(user.id, "123");

  res.send({ firstName: user.firstName, token });
}

function sendAuthError(res) {
  return res.json({ success: false, message: "email incorrect" });
}

function checAuth(req, res, next) {
  if (!req.header("authorization"))
    return res.status(401).send({ message: "UnAuthorized error" });

  var token = req.header("authorization").split(" ")[1];
  var payload = jwt.decode(token, "123");

  if (!payload) return res.status(401).send({ message: "UnAuthorized error" });

  req.user = payload;
  next();
}

app.use("/auth", auth);

app.listen(port, () => {
  console.log(`app is running on ${port}`);
});
