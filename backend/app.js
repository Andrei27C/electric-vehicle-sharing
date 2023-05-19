const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const Web3 = require("web3");
const axios = require("axios");

dotenv.config();
const web3 = new Web3(process.env.ETHER_RPC_WSS);
const app = express();
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

const getVehiclesData = async () => {
  // console.log("electricVehicleContract:", electricVehicleContract);

  const totalSupply = await electricVehicleContract.methods.totalSupply().call();
  console.log("totalSupply:", totalSupply);

  const vehicles = [];

  for (let i = 0; i < totalSupply; i++) {
    // const tokenId = await electricVehicleContract.methods.tokenByIndex(i).call();
    const vehicle = await electricVehicleContract.methods.getVehicleData(i).call();
    if(vehicle.endTime<Date.now())

    // console.log(vehicle);
    vehicle.startTime = toDateTime(vehicle.startTime);
    vehicle.endTime = toDateTime(vehicle.endTime);

    vehicles.push({
      tokenId: i,
      make: vehicle.make,
      model: vehicle.model,
      price: vehicle.price,
      startTime: vehicle.startTime,
      endTime: vehicle.endTime
    });
  }
  return vehicles;
};
app.get("/get-vehicles", async (req, res) => {
  console.log("-----/get-vehicles-----");
  try {
    const vehicles = await getVehiclesData();
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
      price: vehicle.price,
      startTime: vehicle.startTime,
      endTime: vehicle.endTime,
      appAddress: vehicle.appAddress
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
    const owner = await electricVehicleContract.methods.ownerAddress().call();
    res.send({ owner });
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch owner address" });
  }
});

//create-vehicle endpoint
app.post("/create-vehicle", async (req, res) => {
  console.log("Calling create vehicle endpoint...");
  const { make, model, price } = req.body;
  console.log("  Input parameters:", { make, model, price, accountAddress: account.address });

  let gas;
  try {
    const contractMethod = electricVehicleContract.methods.mintVehicle(account.address, make, model, price);
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
      data: electricVehicleContract.methods.mintVehicle(account.address, make, model, price).encodeABI()
    };

    const signedTx = await account.signTransaction(tx);
    console.log("  Signer address:", account.address);

    // console.log('Raw transaction:', signedTx.rawTransaction);
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);


    res.json({ success: true, message: "Vehicle created", txHash: txReceipt.transactionHash });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

//get one vehicle endpoint
app.get("/vehicles/:tokenId", async (req, res) => {
  const { tokenId } = req.params;

  try {
    const vehicleData = await electricVehicleContract.methods.getVehicleData(tokenId).call();
    const vehicle = {
      tokenId,
      make: vehicleData.make,
      model: vehicleData.model,
      price: vehicleData.price
    };

    res.json({ success: true, vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

//rent endpoint
async function getVehicleInfo(tokenId) {
  try {
    const owner = await electricVehicleContract.methods.getOwner(tokenId).call();
    const startTime = await electricVehicleContract.methods.getStartTime(tokenId).call();
    const endTime = await electricVehicleContract.methods.getEndTime(tokenId).call();

    console.log(`Vehicle ${tokenId} Info:`);
    console.log(`  Owner: ${owner}`);
    console.log(`  Start Time: ${startTime}`);
    console.log(`  End Time: ${endTime}`);
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
  let { endTime, rentalFeeUSD } = req.body;

  if (!renterPrivateKey || !endTime || !rentalFeeUSD) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  console.log("asd");
  //calculate start time from now in seconds
  const startTime = Math.floor(Date.now() / 1000);
  //transform end time to seconds
  endTime = Math.floor(Date.parse(endTime) / 1000);

  console.log("  Input parameters:", { tokenId, startTime, endTime, rentalFeeUSD, renterPrivateKey });


  let gas;
  try {
    const renterAccount = web3.eth.accounts.privateKeyToAccount(renterPrivateKey);
    console.log("  Renter address:", renterAccount.address);
    const rentalFeeEtherPerHour = await convertRentalFeeToEther(rentalFeeUSD);
    let rentalFeeEther = rentalFeeEtherPerHour * (endTime - startTime) / 3600;
    //todo remove this
    // let rentalFeeEther = 1399897052300710;
    console.log("rentalFeeEther: ", rentalFeeEther);
    // let gas = await electricVehicleContract.methods
    //   .rentVehicle(tokenId)
    //   .estimateGas({ from: renterAccount.address, value: rentalFeeEther });
    // console.log("gas: ", gas);
    console.log("TIMES: " + startTime + " " + endTime);
    gas = 6721970;
    console.log("gas2: ", gas);
    const nonce = await web3.eth.getTransactionCount(renterAccount.address);
    console.log("  Nonce:", nonce);
    // build the transaction
    const data = electricVehicleContract.methods.rentVehicle(tokenId, startTime, endTime).encodeABI();
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
      value: rentalFeeEther,
      gas,
      nonce,
      data: electricVehicleContract.methods.rentVehicle(tokenId, startTime, endTime).encodeABI(),
    };
    console.log("tx: ", tx);
    // Sign the transaction
    const signedTx = await renterAccount.signTransaction(tx);

    // Send the transaction
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    res.json({ success: true, message: "Vehicle rented", txHash: txHash });

    // // sign the transaction
    // const customCommon = Common.forCustomChain(
    //   'mainnet',
    //   {
    //     name: 'my-network',
    //     networkId: networkId,
    //     chainId: chainId,
    //   },
    //   'petersburg'  // hardfork
    // )

    //
    // // const common = new Common({ chain: customChain });
    // const chainId = await web3.eth.net.getId();
    // console.log("chainId: ", chainId);
    // const tx = new Tx(txData, {  common: customCommon });
    // console.log("123_tx: ", tx);
    //
    // const renterPrivateKeyBuffer = Buffer.from('5d1d5ccb1a6923d78c173d18c4c82510cafbfc3632d517f157334498f728189a', 'hex');  // No '0x' at the start
    //
    // tx.sign(renterPrivateKeyBuffer);
    // console.log("124_tx: ", tx);
    //
    // const serializedTx = tx.serialize();
    // console.log("125_serializedTx: ", serializedTx);
    //
    // const rawTx = "0x" + serializedTx.toString("hex");
    // console.log("126_raw: ", rawTx);
    //
    // const txReceipt = await web3.eth.sendSignedTransaction(rawTx);
    // console.log("127_txReceipt: ", txReceipt);
    //

    // const signedTx = await renterAccount.signTransaction(tx);
    // console.log("signedTx: ", signedTx);
    // // const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    // // console.log("txReceipt: ", txReceipt);
    //
    // await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    //   .on("transactionHash", (hash) => {
    //     console.log("Transaction hash:", hash);
    //   })
    //   .on("receipt", (receipt) => {
    //     console.log("Transaction receipt:", receipt);
    //     res.json({ success: true, message: "Vehicle rented", txHash: receipt.transactionHash });
    //   })
    //   .on("error", (error) => {
    //     console.log("Transaction error:", error);
    //     res.status(400).json({ success: false, message: error.message });
    //   });
    // console.log("after sendSignedTransaction");
    //
    // await electricVehicleContract.events.VehicleRented({
    //   //filter: {tokenId: tokenId}, // Using tokenId as a filter
    //   fromBlock: "latest" // Only listening for the latest block
    // }, function(error, event) {
    //   if (error) {
    //     console.error(error);
    //   } else {
    //     console.log("Event data:" + event); // This will log the event data
    //   }
    // });

    // electricVehicleContract.events.VehicleRented({}, (error, event) => {
    //   if (error) {
    //     console.error('Error in event:', error);
    //   } else {
    //     console.log('Event data:', event);
    //   }
    // });
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
      .endRental(tokenId)
      .estimateGas({ from: renterAccount.address });
    const nonce = await web3.eth.getTransactionCount(renterAccount.address);

    const tx = {
      from: renterAccount.address,
      to: electricVehicleAddress,
      gas,
      nonce,
      data: electricVehicleContract.methods.endRental(tokenId).encodeABI()
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
      .endRental(tokenId)
      .estimateGas({ from: renterAccount.address });
    const nonce = await web3.eth.getTransactionCount(renterAccount.address);

    const tx = {
      from: renterAccount.address,
      to: electricVehicleAddress,
      gas,
      nonce,
      data: electricVehicleContract.methods.endRental(tokenId).encodeABI()
    };

    const signedTx = await renterAccount.signTransaction(tx);
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    res.json({ success: true, message: "Rental ended", txHash });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

