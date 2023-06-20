const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const session = require("express-session");

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

//use express session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

//utils
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";

//account info
// const privateKey = process.env.TD_DEPLOYER_PRIVATE_KEY;
// console.log("Private Key: ", privateKey);
// const account = web3.eth.accounts.privateKeyToAccount(privateKey);
// console.log("Account Address: ", account.address);

//user routes
const userRoutes = require('./routes/userRoutes');
app.use(userRoutes); // Add user routes to middleware chain.

//auth routes
const authRoutes = require('./routes/authRoutes');
app.use(authRoutes); // Add auth routes to middleware chain.

//owner routes
const ownerRoutes = require('./routes/ownerRoutes');
app.use(ownerRoutes); // Add auth routes to middleware chain.

//start server
app.listen(PORT, HOST, () => {
  console.log(`Server running at ${HOST}:${PORT}`);
});

//server methods
app.get("/", (req, res) => {
  res.send("EV Sharing API");
});
