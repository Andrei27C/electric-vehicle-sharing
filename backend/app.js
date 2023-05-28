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
const db = require("./database/db.js");
const UserModel = require("./models/user.js");
let userModelInstance = new UserModel();
const dbQueries = require('./database/queries');

//user
const userRoutes = require('./routes/userRoutes');
app.use(userRoutes);

//web3
const { web3, electricVehicleContract, electricVehicleAddress } = require('./config/web3');

//utils
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";

//utils
const exchange = require("./utils/exchangeRate.js");
const { getUserFunds, getUserPoints, getUserFundsData_FromContract, getUserPointsData,
  getUserRentedVehicleData_FromContract
} = require("./controllers/userController");
const { updateUserInDB } = require("./database/queries");

//initial tax
const INITIAL_TAX = 1; //in dollars

//account info
const privateKey = process.env.TD_DEPLOYER_PRIVATE_KEY;
console.log("Private Key: ", privateKey);
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
console.log("Account Address: ", account.address);

//start server
app.listen(PORT, HOST, () => {
  console.log(`Server running at ${HOST}:${PORT}`);
});


//server methods
app.get("/", (req, res) => {
  res.send("EV Sharing API");
});

function toDateTime(secs) {
  let t = new Date(1970, 0, 1); // Epoch
  t.setSeconds(secs);
  return t;
}

//section login
// Registration route
app.post("/register", (req, res) => {
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
});

app.post("/login", async (req, res) => {
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
});
//end section login

const getOwner = async () => {
  return await electricVehicleContract.methods.owner().call();
};


const getPreparedForFrontendVehicleData = async (vehicleId) => {
  const vehicle = await electricVehicleContract.methods.getAllVehicleData(vehicleId).call();

  // Prepare data for frontend
  vehicle.pricePerHour = await exchange.convertWeiToUsd(vehicle.pricePerHour);
  vehicle.pricePerHour = parseFloat(vehicle.pricePerHour).toFixed(2);
  vehicle.startTime = toDateTime(vehicle.startTime);

  return vehicle;
}

const getVehiclesData = async (ownerScreen) => {
  const totalSupply = await electricVehicleContract.methods.totalSupply().call();
  const contractOwner = await getOwner();
  const vehicles = [];

  for (let i = 0; i < totalSupply; i++) {
    const vehicle = await getPreparedForFrontendVehicleData(i);

    if(vehicle.active && vehicle.currentRenter === contractOwner && !ownerScreen){
      vehicles.push({
        tokenId: i,
        make: vehicle.make,
        model: vehicle.model,
        pricePerHour: vehicle.pricePerHour,
        maxRentalHours: vehicle.maxRentalHours,
        startTime: vehicle.startTime,
      });
    }
    else
    {
      vehicles.push({
        tokenId: i,
        make: vehicle.make,
        model: vehicle.model,
        pricePerHour: vehicle.pricePerHour,
        maxRentalHours: vehicle.maxRentalHours,
        startTime: vehicle.startTime,
        currentRenter: vehicle.currentRenter,
        active: vehicle.active
      });
    }

  }
  return vehicles;
};
app.get("/get-vehicles", async (req, res) => {
  console.log("-----/get-vehicles-----");
  try {
    const vehicles = await getVehiclesData(false);
    // console.log("vehicles:", vehicles)
    res.json({ success: true, vehicles });
  } catch (error) {
    console.error("Failed to fetch vehicles:", error);
    res.status(500).json({ success: false, message: "Failed to fetch vehicles" });
  }
});

const getAllVehiclesData = async () => {
  const totalSupply = await electricVehicleContract.methods.totalSupply().call();
  const vehicles = [];

  for (let i = 0; i < totalSupply; i++) {
    const vehicle = await getPreparedForFrontendVehicleData(i);

    vehicles.push({
      tokenId: i,
      make: vehicle.make,
      model: vehicle.model,
      pricePerHour: vehicle.pricePerHour,
      maxRentalHours: vehicle.maxRentalHours,
      startTime: vehicle.startTime,
      currentRenter: vehicle.currentRenter,
      active: vehicle.active
    });
  }

  return vehicles;
};

app.get("/get-all-vehicles-data", async (req, res) => {
  console.log("-----/get-all-vehicles-data-----");
  try {
    const vehicles = await getVehiclesData(true);
    res.json({ success: true, vehicles });
  } catch (error) {
    console.error("Failed to fetch vehicles:", error);
    res.status(500).json({ success: false, message: "Failed to fetch vehicles" });
  }
});

//get contract owner address
app.get("/contract-owner", async (req, res) => {
  console.log("-----/contract-owner-----");
  try {
    const owner = await electricVehicleContract.methods.getOwner().call();
    console.log("   owner:", owner);
    res.send({ owner });
  } catch (error) {
    console.log("   Failed to fetch owner address:", error);
    res.status(500).send({ error: "Failed to fetch owner address" });
  }
});

//create-vehicle endpoint
app.post("/create-vehicle", async (req, res) => {
  const { role, make, model, pricePerHour: pricePerHourUSD } = req.body;

  console.log("-----/create-vehicle-----");
  console.log("userRole: " , role);
  console.log("Calling create vehicle endpoint...");
  if (role !== "admin") {
    console.log("  Forbidden! You are not the owner.");
    return res.status(403).json({ message: "Forbidden! You are not the owner." });
  }
  console.log("  Input parameters:", { make, model, pricePerHour: pricePerHourUSD, accountAddress: account.address });
  const pricePerHourWei = await exchange.convertUsdToWei(pricePerHourUSD);
  console.log("  rentalFeeWeiPerHour:", pricePerHourWei);

  // Estimate gas
  let gas;
  try {
    const contractMethod = electricVehicleContract.methods.createVehicle(make, model, pricePerHourWei);
    // gas = await contractMethod.estimateGas();
    gas = 500000;
  } catch (error) {
    console.error("Error estimating gas:", error.message);
    res.status(500).json({ success: false, message: "Error estimating gas", error: error.message });
    return;
  }

  // Create transaction
  try {
    const nonce = await web3.eth.getTransactionCount(account.address);
    console.log("  Nonce:", nonce);
    const tx = {
      from: account.address,
      to: electricVehicleContract.options.address,
      gas,
      nonce,
      data: electricVehicleContract.methods.createVehicle(make, model, pricePerHourWei).encodeABI()
    };
    const signedTx = await account.signTransaction(tx);
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    res.json({ success: true, message: "Vehicle created", txHash: txReceipt.transactionHash });
  } catch (error) {
    console.error("Error creating vehicle:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
  console.log("----end-----/create-vehicle-----");
});

//get one vehicle endpoint
app.get("/vehicles/:tokenId", async (req, res) => {
  console.log("Calling get vehicle endpoint...");
  const { tokenId } = req.params;
  console.log("  Input parameters:", { tokenId });
  try {
    const vehicleData = await electricVehicleContract.methods.getAllVehicleData(tokenId).call();
    console.log("vehicleData:", vehicleData);
    const vehicle = {
      tokenId, make: vehicleData.make, model: vehicleData.model, pricePerHour: vehicleData.pricePerHour
    };

    res.json({ success: true, vehicle });
  } catch (error) {
    console.log("Error fetching vehicle:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

//rent vehicle endpoint
app.post("/rent-vehicle/:tokenId", async (req, res) => {
  console.log("---/rent-vehicle/:tokenId---");
  //todo: send the private key from the app
  const renterPrivateKey = userModelInstance.privateKey;
  const { tokenId } = req.params;

  if (!renterPrivateKey) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  //calculate start time from now in seconds
  const startTime = Math.floor(Date.now() / 1000);

  console.log("  Input parameters:", { tokenId, startTime, renterPrivateKey });

  let gas;
  try {
    const renterAccount = web3.eth.accounts.privateKeyToAccount(renterPrivateKey);
    console.log("  Renter address:", renterAccount.address);

    console.log("  TIMES: " + startTime);
    gas = 6721970;
    console.log("  gas2: ", gas);
    const nonce = await web3.eth.getTransactionCount(renterAccount.address);
    console.log("  Nonce:", nonce);
    // build the transaction
    const data = electricVehicleContract.methods.rentVehicle(tokenId).encodeABI();
    console.log(data);

    const tx = {
      from: renterAccount.address,
      to: electricVehicleAddress,
      gas,
      nonce,
      data: data
    };
    console.log("tx: ", tx);
    // Sign the transaction
    const signedTx = await renterAccount.signTransaction(tx);

    // Send the transaction
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    // Update user in db
    userModelInstance.vehicleId = tokenId;
    await updateUserInDB(userModelInstance);

    res.json({ success: true, message: "Vehicle rented", txHash: txHash });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
    console.log(error);
  }
});

//end-rental endpoint
// Function to handle the end rental logic
const endRental = async (tokenId, initialTax, kilometersDriven, privateKey) => {
  try {
    console.log('tokenId: ', tokenId, 'initialTax: ', initialTax, 'kilometersDriven: ', kilometersDriven, 'privateKey: ', privateKey);
    let currentTime = Math.floor(Date.now() / 1000); // current time in seconds

    //todo remove this
    currentTime = currentTime + 3600;

    const data = electricVehicleContract.methods.endRental(
      tokenId,
      currentTime,
      initialTax,
      kilometersDriven
    ).encodeABI();

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);

    const nonce = await web3.eth.getTransactionCount(account.address);
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 6721975; // you may need to adjust this value

    const tx = {
      from: account.address,
      to: electricVehicleAddress,
      gasLimit,
      nonce,
      data: data
    };


    const signedTx = await account.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log("    a mers:  ",receipt);
    return true;
  } catch (error) {
    console.error(error);
  }
  return false;
};

app.post("/end-rental/:userId", async (req, res) => {
  console.log("---/end-rental/:userId---");

  const { userId } = req.params;
  console.log("userId: ", userId);
  const user = await dbQueries.getUserFromDBById(userId);
  console.log("user: ", user);
  const renterAccount = user.privateKey;
  console.log("renterAccount: ", renterAccount);
  try {
    const KILOMETERS_DRIVEN = 50;
    const vehicleId = (await getUserRentedVehicleData_FromContract(userId))?.vehicle?.id;
    const receipt = await endRental(vehicleId, INITIAL_TAX, KILOMETERS_DRIVEN, renterAccount);

    // Update user in db
    userModelInstance.vehicleId = (receipt === true) ? null : userModelInstance.vehicleId;
    console.log("       ------vehicleId ", userModelInstance.vehicleId);
    await updateUserInDB(userModelInstance);

    res.json({ success: true, message: "Rental ended", receipt });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
