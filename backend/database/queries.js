const db = require("./db");
const UserModel = require("../models/user");

const getUserFromDBById = async (userId) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) {
        reject(err);
      }
      if (row) {
        let user = UserModel.fromDB(row);
        resolve(user);
      } else {
        console.log(`No user found with id ${userId}`);
        reject(`No user found with id ${userId}`);
      }
    });
  });
}

const updateUserInDB = async (user) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE users 
      SET username = ?, password = ?, role = ?, points = ?, funds = ?, address = ?
      WHERE id = ?
    `;
    const values = [user.username, user.password, user.role, user.points, user.funds, user.address, user.id];

    db.run(sql, values, function(err) {
      if (err) {
        reject(err);
      }
      console.log(`User with id ${user.id} was updated.`);
      resolve(this.changes);
    });
  });
};

module.exports.updateUserInDB = updateUserInDB;

module.exports.getUserFromDBById = getUserFromDBById;
