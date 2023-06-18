const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../database/db.js");
const web3 = require("../config/web3");
const UserModel = require("../models/user");
let userModelInstance = new UserModel();

const {
  getUserFundsData_FromContract,
  getUserPointsData,
  getUserRentedVehicleData_FromContract
} = require("./userController");
const dbQueries = require("../database/queries");

exports.register = (req, res) => {
  console.log("---register---");
  const { username, password, privateKey } = req.body;

  // check if username already exists
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error checking username" });
    }

    if (row) {
      console.log("Username already exists");
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash the password
    bcrypt.hash(password, 10, function(err, hash) {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error hashing password" });
      }

      // Store new user in the database
      const address = web3.eth.accounts.privateKeyToAccount(privateKey).address;
      console.log("   Address: ", address)
      db.run(`INSERT INTO users(username, password, role, points, address, privateKey) VALUES (?,?,?,?,?,?)`, [username, hash, "user", 0, address, privateKey], function(err) {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Error storing user" });
        }

        const userId = this.lastID;
        const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "1 day" });

        res.json({ success: true,  message: "Registration successful", token });
      });
    });
  });
};

exports.login = async (req, res) => {
  console.log("---login---");
  const { username, password } = req.body;
  // Get user from database
  db.get(`SELECT * FROM users WHERE username = ?`, [username], async function(err, row) {
    if (err) {
      return res.status(500).json({ error: "Error retrieving user" });
    }

    if (!row) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Compare passwords
    bcrypt.compare(password, row.password, async function(err, match) {
      if (err) {
        return res.status(500).json({ error: "Error comparing passwords" });
      }

      if (!match) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Passwords match, create a JWT
      const token = jwt.sign({ sub: row.id }, process.env.JWT_SECRET, { expiresIn: "1 day" });

      // update user in database
      userModelInstance = new UserModel(row.id, row.username, row.password, row.role, row.points, row.funds, row.address, row.vehicleId, row.privateKey);
      try {
        userModelInstance.funds = (await getUserFundsData_FromContract(userModelInstance.id)).funds;
        userModelInstance.points = (await getUserPointsData(userModelInstance.id)).points;
        userModelInstance.vehicleId = (await getUserRentedVehicleData_FromContract(userModelInstance.id))?.vehicle?.id;
        console.log("    userModelInstance:", userModelInstance);
        await dbQueries.updateUserInDB(userModelInstance);
        console.log("    updated user at login");
      } catch (err) {
        console.log(err);
      }
      res.json({ message: "Login successful", token: token, user: userModelInstance });
    });
  });
};

module.exports = userModelInstance;
