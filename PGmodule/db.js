const express = require("express");
const { Pool, Client } = require("pg");

const connectionString = "postgresql://postgres:madrid@localhost:5432/TestPG";
const pool = new Pool({
  connectionString: connectionString,
});

class Controllers {
  async getMessages() {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM data";
      pool.query(query, (err, res) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(res.rows);
          resolve(res.rows);
        }
      });
    });
  }

  async getMessagesbyUser(user) {
    const query = "SELECT * FROM data where owner like '%" + user + "%'";
    return new Promise((resolve, reject) => {
      pool.query(query, (err, res) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(res.rows);
          resolve(res.rows);
        }
      });
    });
  }

  async postMessages(msgs) {
    var i1 = msgs.owner;
    // console.log(i1);
    var i2 = msgs.test;
    const query = "INSERT INTO data(owner,test) VALUES($1, $2) RETURNING*";
    const values = [i1, i2];
    return new Promise((resolve, reject) => {
      pool.query(query, values, (err, res) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(res.rows[0]);
          resolve(res.rows[0]);
        }
      });
    });
  }

  async postRegister(user) {
    const query =
      "INSERT INTO data(firstname,lastName,email,password) VALUES($1, $2,$3,$4) RETURNING*";
    const values = [user.firstName, user.lastName, user.email, user.password];
    return new Promise((resolve, reject) => {
      pool.query(query, values, (err, res) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(res.rows[0]);
          resolve(res.rows[0]);
        }
      });
    });
  }
}

module.exports = Controllers;
