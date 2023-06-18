const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();


//jwt
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const expressJwt = require("express-jwt");
app.use(expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"]
}).unless({ path: ["/login", "/register"] }));

//database
const dbQueries = require('./database/queries');

//user
const userRoutes = require('./routes/userRoutes');
app.use(userRoutes); // Add user routes to middleware chain.

//auth
const authRoutes = require('./routes/authRoutes');
const { userModelInstance } = require('./models/user');
app.use(authRoutes); // Add auth routes to middleware chain.

//web3
const { web3 } = require('./config/web3');
const { bankContract, bankContractAddress } = require('./config/web3');
const { vehicleManagerContract, vehicleManagerContractAddress } = require('./config/web3');
const { rentalContract, rentalContractAddress } = require('./config/web3');

//utils
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";

//utils
const exchange = require("./utils/exchangeRate.js");
const { getUserFundsData_FromContract, getUserPointsData,
  getUserRentedVehicleData_FromContract
} = require("./controllers/userController");
const { updateUserInDB, getUserFromDBById } = require("./database/queries");
const { epochSecondsToDateTime } = require("./utils/timeConverter");

//initial tax
const INITIAL_TAX = 1; //in dollars

//account info
// const privateKey = process.env.TD_DEPLOYER_PRIVATE_KEY;
// console.log("Private Key: ", privateKey);
// const account = web3.eth.accounts.privateKeyToAccount(privateKey);
// console.log("Account Address: ", account.address);

//start server
app.listen(PORT, HOST, () => {
  console.log(`Server running at ${HOST}:${PORT}`);
});

//server methods
app.get("/", (req, res) => {
  res.send("EV Sharing API");
});





