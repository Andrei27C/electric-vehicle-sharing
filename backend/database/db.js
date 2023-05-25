const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./ev-users.sqlite', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE if not exists users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    )`, (err) => {
    if (err) {
      console.error(err.message);
    }
  });
});

module.exports = db;
