const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");
const path = require("path");
const Web3 = require("web3");
const axios = require("axios");
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
//web3
const web3 = new Web3(process.env.ETHER_RPC_WSS);
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";

//contract info
const electricVehicleJSON = JSON.parse(fs.readFileSync(path.join(__dirname, "../smart-contract/build/contracts/ElectricVehicle.json"), "utf8"));
const electricVehicleABI = electricVehicleJSON.abi;
// const electricVehicleAddress = electricVehicleJSON.networks["5777"].address;
const electricVehicleAddress = electricVehicleJSON.networks["1337"].address;

console.log("ETHER_RPC_URL:", process.env.ETHER_RPC_WSS);
console.log("ElectricVehicleAddress:", electricVehicleAddress);
const electricVehicleContract = new web3.eth.Contract(electricVehicleABI, electricVehicleAddress);

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
  const { username, password, address } = req.body;

  // check if username already exists
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
    if (err) {
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
      db.run(`INSERT INTO users(username, password, role, points, address) VALUES (?,?,?,?,?)`, [username, hash, "user", 0, address], function(err) {
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

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], function(err, row) {
    if (err) {
      return res.status(500).json({ error: "Error retrieving user" });
    }

    if (!row) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    bcrypt.compare(password, row.password, function(err, match) {
      if (err) {
        return res.status(500).json({ error: "Error comparing passwords" });
      }

      if (!match) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Passwords match, create a JWT
      const token = jwt.sign({ sub: row.id }, process.env.JWT_SECRET, { expiresIn: "1 day" });

      userModelInstance = new UserModel(row.id, row.username, row.password,  row.role, row.points, row.address );

      console.log("user:", userModelInstance);
      res.json({ message: "Login successful", token: token, user: userModelInstance });
    });
  });
});

//end section login

const getVehiclesData = async () => {
  // console.log("electricVehicleContract:", electricVehicleContract);

  const totalSupply = await electricVehicleContract.methods.totalSupply().call();
  console.log("totalSupply:", totalSupply);

  const vehicles = [];

  for (let i = 0; i < totalSupply; i++) {
    // const tokenId = await electricVehicleContract.methods.tokenByIndex(i).call();
    const vehicle = await electricVehicleContract.methods.getAllVehicleData(i).call();

    // console.log(vehicle);
    vehicle.startTime = toDateTime(vehicle.startTime);

    vehicles.push({
      tokenId: i,
      make: vehicle.make,
      model: vehicle.model,
      pricePerHour: vehicle.pricePerHour,
      startTime: vehicle.startTime
    });
  }
  return vehicles;
};
app.get("/get-vehicles", async (req, res) => {
  console.log("-----/get-vehicles-----");
  try {
    const vehicles = await getVehiclesData();
    // console.log("vehicles:", vehicles)
    res.json({ success: true, vehicles });
  } catch (error) {
    console.error("Failed to fetch vehicles:", error);
    res.status(500).json({ success: false, message: "Failed to fetch vehicles" });
  }
});

//get all vehicles data endpoint
const getAllVehiclesData = async () => {
  const totalSupply = await electricVehicleContract.methods.totalSupply().call();
  const vehicles = [];

  for (let i = 0; i < totalSupply; i++) {
    // const tokenId = await electricVehicleContract.methods.tokenByIndex(i).call();
    const vehicle = await electricVehicleContract.methods.getAllVehicleData(i).call();

    vehicles.push({
      tokenId: i,
      make: vehicle.make,
      model: vehicle.model,
      pricePerHour: vehicle.pricePerHour,
      startTime: vehicle.startTime,
      currentRenter: vehicle.currentRenter
    });
  }
  return vehicles;
};
app.get("/get-all-vehicles-data", async (req, res) => {
  console.log("-----/get-all-vehicles-data-----");
  try {
    const vehicles = await getAllVehiclesData();
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
  const { role, make, model, pricePerHour } = req.body;

  console.log("-----/create-vehicle-----");
  console.log("userRole: " , role);
  console.log("Calling create vehicle endpoint...");
  if (role !== "admin") {
    console.log("  Forbidden! You are not the owner.");
    return res.status(403).json({ message: "Forbidden! You are not the owner." });
  }


  console.log("  Input parameters:", { make, model, pricePerHour, accountAddress: account.address });

  let gas;
  try {
    const contractMethod = electricVehicleContract.methods.createVehicle(make, model, pricePerHour);
    // gas = await contractMethod.estimateGas();
    gas = 500000;
  } catch (error) {
    console.error("Error estimating gas:", error.message);
    res.status(500).json({ success: false, message: "Error estimating gas", error: error.message });
    return;
  }
  try {
    const nonce = await web3.eth.getTransactionCount(account.address);
    console.log("  Nonce:", nonce);
    const tx = {
      from: account.address,
      to: electricVehicleContract.options.address,
      gas,
      nonce,
      data: electricVehicleContract.methods.createVehicle(make, model, pricePerHour).encodeABI()
    };

    const signedTx = await account.signTransaction(tx);
    console.log("  Signer address:", account.address);

    // console.log('Raw transaction:', signedTx.rawTransaction);
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

//rent endpoint
async function getVehicleInfo(tokenId) {
  try {
    const owner = await electricVehicleContract.methods.getOwner(tokenId).call();
    const startTime = await electricVehicleContract.methods.getStartTime(tokenId).call();

    console.log(`Vehicle ${tokenId} Info:`);
    console.log(`  Owner: ${owner}`);
    console.log(`  Start Time: ${startTime}`);
  } catch (error) {
    console.error("Error fetching vehicle info:", error);
  }
}

const convertRentalFeeToEther = async (rentalFeeUSD) => {
  try {
    const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
    const etherPriceUSD = response.data.ethereum.usd;
    return web3.utils.toWei((rentalFeeUSD / etherPriceUSD).toString(), "ether");
  } catch (error) {
    throw new Error("Could not calculate rental fee");
  }
};

app.post("/rent-vehicle/:tokenId", async (req, res) => {
  console.log("---/rent-vehicle/:tokenId---");
  //todo: send the private key from the app
  const renterPrivateKey = process.env.TD_ACCOUNT_1_PRIVATE_KEY;
  const { tokenId } = req.params;
  let { rentalFeeUSD } = req.body;

  if (!renterPrivateKey || !rentalFeeUSD) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  console.log("asd");
  //calculate start time from now in seconds
  const startTime = Math.floor(Date.now() / 1000);

  console.log("  Input parameters:", { tokenId, startTime, rentalFeeUSD, renterPrivateKey });


  let gas;
  try {
    const renterAccount = web3.eth.accounts.privateKeyToAccount(renterPrivateKey);
    console.log("  Renter address:", renterAccount.address);
    const rentalFeeEtherPerHour = await convertRentalFeeToEther(rentalFeeUSD);
    // let rentalFeeEther = rentalFeeEtherPerHour * ( - startTime) / 3600;
    //todo remove this
    // let rentalFeeEther = 1399897052300710;
    // console.log("rentalFeeEther: ", rentalFeeEther);
    // let gas = await electricVehicleContract.methods
    //   .rentVehicle(tokenId)
    //   .estimateGas({ from: renterAccount.address, value: rentalFeeEther });
    // console.log("gas: ", gas);
    console.log("TIMES: " + startTime);
    gas = 6721970;
    console.log("gas2: ", gas);
    const nonce = await web3.eth.getTransactionCount(renterAccount.address);
    console.log("  Nonce:", nonce);
    // build the transaction
    const data = electricVehicleContract.methods.rentVehicle(tokenId).encodeABI();
    console.log(data);
    // const txData = {
    //   gas,
    //   chainId: 1337,
    //   from: renterAccount.address,
    //   to: "0x96FE9eAA58908B77f5a1CE3a361f43251890BF47",
    //   nonce: nonce,
    //   value: rentalFeeEther,
    //   data: data
    // };

    const tx = {
      from: renterAccount.address,
      to: electricVehicleAddress,
      gas,
      nonce,
      data: electricVehicleContract.methods.rentVehicle(tokenId).encodeABI()
    };
    console.log("tx: ", tx);
    // Sign the transaction
    const signedTx = await renterAccount.signTransaction(tx);

    // Send the transaction
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    res.json({ success: true, message: "Vehicle rented", txHash: txHash });

    await getVehicleInfo(tokenId);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
    console.log(error);
  }
});


//end-rental endpoint
// Function to handle the end rental logic
async function endRental(tokenId, renterPrivateKey) {
  console.log("---/end-rental/:tokenId---");

  const renterAccount = web3.eth.accounts.privateKeyToAccount(renterPrivateKey);

  try {
    const gas = await electricVehicleContract.methods
      .endRental(tokenId, INITIAL_TAX)
      .estimateGas({ from: renterAccount.address });
    const nonce = await web3.eth.getTransactionCount(renterAccount.address);

    const tx = {
      from: renterAccount.address,
      to: electricVehicleAddress,
      gas,
      nonce,
      data: electricVehicleContract.methods.endRental(tokenId, INITIAL_TAX).encodeABI()
    };

    const signedTx = await renterAccount.signTransaction(tx);
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return { success: true, message: "Rental ended", txHash };
  } catch (error) {
    throw new Error(error.message);
  }
}

app.post("/end-rental/:tokenId", async (req, res) => {
  console.log("---/end-rental/:tokenId---");

  const { tokenId } = req.params;
  const { renterPrivateKey } = req.body;
  const renterAccount = web3.eth.accounts.privateKeyToAccount(renterPrivateKey);

  try {
    const gas = await electricVehicleContract.methods
      .endRental(tokenId, INITIAL_TAX)
      .estimateGas({ from: renterAccount.address });
    const nonce = await web3.eth.getTransactionCount(renterAccount.address);

    const tx = {
      from: renterAccount.address,
      to: electricVehicleAddress,
      gas,
      nonce,
      data: electricVehicleContract.methods.endRental(tokenId, INITIAL_TAX).encodeABI()
    };

    const signedTx = await renterAccount.signTransaction(tx);
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    res.json({ success: true, message: "Rental ended", txHash });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.get("/get-user-points/:userId", async (req, res) => {
  console.log("---/get-user-points/:userId---");

  const { userId } = req.params;
  try {
    const { userId } = req.params;
    // Use the contract's balanceOf method to fetch the user's points
    const points = await electricVehicleContract.methods.getPoints().call();
    res.json({ points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get("/user/:userId", async (req, res) => {
  console.log("---/user/:userId---");
  try {
    const userId  = req.params;
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (row) {
        let user = UserModel.fromDB(row);
        console.log(user);
        res.json({ user });
      } else {
        console.log(`No user found with id ${userId}`);
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

