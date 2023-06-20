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
      SET username = ?, password = ?, role = ?, points = ?, funds = ?, address = ?, vehicleId = ?
      WHERE id = ?
    `;
    const values = [user.username, user.password, user.role, user.points, user.funds, user.address, user.vehicleId, user.id];

    db.run(sql, values, function(err) {
      if (err) {
        console.log(`Failed to update user with id ` + user.id + `:`, err);
        reject(err);
      }
      console.log(`User with id ` + user.id + ` was updated.`);
      resolve(this.changes);
    });
  });
};

const getAllUsersFromDB = async () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
      if (err) {
        reject(err);
      }
      if (rows) {
        let users = rows.map(row => UserModel.fromDB(row));
        resolve(users);
      } else {
        console.log("No users found");
        reject("No users found");
      }
    });
  });
};

module.exports.getAllUsersFromDB = getAllUsersFromDB;
module.exports.updateUserInDB = updateUserInDB;
module.exports.getUserFromDBById = getUserFromDBById;
