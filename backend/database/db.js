const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("./ev-users.sqlite", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the SQLite database.");
});

db.serialize(() => {
  db.run(`CREATE TABLE if not exists users (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        points INTEGER DEFAULT 0,
        funds INTEGER DEFAULT 0,
        address TEXT NOT NULL,
        vehicleId INTEGER DEFAULT null,
        privateKey TEXT NOT NULL
    )`, (err) => {
    if (err) {
      console.error(err.message);
    }
  });
  db.run(`CREATE TABLE if not exists vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        pricePerHour INTEGER NOT NULL,
        maxRentalHours INTEGER NOT NULL,
        startTime INTEGER DEFAULT null,
        currentRenter INTEGER DEFAULT null,
        active INTEGER DEFAULT 1
    )`, (err) => {
    if (err) {
      console.error(err.message);
    }
  });
});

module.exports = db;
