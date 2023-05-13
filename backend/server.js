const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Web3 = require('web3');

dotenv.config();
const web3 = new Web3(process.env.ETHER_RPC_URL);
const server = express();
server.use(cors());
server.use(express.json());
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

//contract info
const electricVehicleJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../smart-contract/build/contracts/ElectricVehicle.json'), 'utf8'));
const electricVehicleABI = electricVehicleJSON.abi;
const electricVehicleAddress = electricVehicleJSON.networks['5777'].address;
console.log("ETHER_RPC_URL:", process.env.ETHER_RPC_URL);
console.log("ElectricVehicleAddress:", electricVehicleAddress);
const electricVehicleContract = new web3.eth.Contract(electricVehicleABI, electricVehicleAddress);

//account info
const privateKey = process.env.TD_DEPLOYER_PRIVATE_KEY;
console.log("Private Key: ",privateKey);
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
console.log("Account Address: ",account.address);

//start server
server.listen(PORT, HOST, () => {
  console.log(`Server running at ${HOST}:${PORT}`);
});


//server methods
server.get('/', (req, res) => {
  res.send('EV Sharing API');
});

const getVehiclesData = async () => {
  // console.log("electricVehicleContract:", electricVehicleContract);

  const totalSupply = await electricVehicleContract.methods.totalSupply().call();
  console.log("totalSupply:", totalSupply);

  const vehicles = [];

  for (let i = 0; i < totalSupply; i++) {
    // const tokenId = await electricVehicleContract.methods.tokenByIndex(i).call();
    const vehicle = await electricVehicleContract.methods.getVehicleData(i).call();

    vehicles.push({
        tokenId: i,
        make: vehicle.make,
        model: vehicle.model,
        price: web3.utils.fromWei(vehicle.price, 'ether'),
    });
  }
  return vehicles;
};
server.get('/get-vehicles', async (req, res) => {
  console.log("-----/get-vehicles-----");
  try {
    const vehicles = await getVehiclesData();
    res.json({ success: true, vehicles });
  } catch (error) {
    console.error('Failed to fetch vehicles:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
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
      appAddress: vehicle.appAddress,
    });
  }
  return vehicles;
};
server.get('/get-all-vehicles-data', async (req, res) => {
  console.log("-----/get-all-vehicles-data-----");
  try {
    const vehicles = await getAllVehiclesData();
    res.json({ success: true, vehicles });
  } catch (error) {
    console.error('Failed to fetch vehicles:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
  }
});

//get contract owner address
server.get('/contract-owner', async (req, res) => {
  console.log("-----/contract-owner-----");
  try {
    const owner = await electricVehicleContract.methods.ownerAddress().call();
    res.send({ owner });
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch owner address' });
  }
});

//create-vehicle endpoint
server.post('/create-vehicle', async (req, res) => {
  console.log("Calling create vehicle endpoint...");
  const { make, model, price } = req.body;
  console.log('  Input parameters:', { make, model, price, accountAddress: account.address });

  let gas;
  try {
    const contractMethod = electricVehicleContract.methods.mintVehicle(account.address, make, model, price);
    // gas = await contractMethod.estimateGas();
    gas = 500000;
  } catch (error) {
    console.error('Error estimating gas:', error.message);
    res.status(500).json({ success: false, message: 'Error estimating gas', error: error.message });
    return;
  }
  try {
    const nonce = await web3.eth.getTransactionCount(account.address);
    console.log('  Nonce:', nonce);
    const tx = {
      from: account.address,
      to: electricVehicleContract.options.address,
      gas,
      nonce,
      data: electricVehicleContract.methods.mintVehicle(account.address, make, model, price).encodeABI(),
    };

    const signedTx = await account.signTransaction(tx);
    console.log('  Signer address:', account.address);

    // console.log('Raw transaction:', signedTx.rawTransaction);
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);


    res.json({ success: true, message: 'Vehicle created', txHash: txReceipt.transactionHash });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

//get one vehicle endpoint
server.get('/vehicles/:tokenId', async (req, res) => {
  const { tokenId } = req.params;

  try {
    const vehicleData = await electricVehicleContract.methods.getVehicleData(tokenId).call();
    const vehicle = {
      tokenId,
      make: vehicleData.make,
      model: vehicleData.model,
      price: vehicleData.price,
    };

    res.json({ success: true, vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

//rent endpoint
server.post('/rent/:tokenId', async (req, res) => {
  const { tokenId } = req.params;
  const { renterPrivateKey, startTime, endTime } = req.body;
  const renterAccount = web3.eth.accounts.privateKeyToAccount(renterPrivateKey);

  try {
    const gas = await electricVehicleContract.methods
      .rentVehicle(tokenId, startTime, endTime)
      .estimateGas({ from: renterAccount.address });
    const nonce = await web3.eth.getTransactionCount(renterAccount.address);

    const tx = {
      from: renterAccount.address,
      to: contractAddress,
      gas,
      nonce,
      data: electricVehicleContract.methods.rentVehicle(tokenId, startTime, endTime).encodeABI(),
    };

    const signedTx = await renterAccount.signTransaction(tx);
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    res.json({ success: true, message: 'Vehicle rented', txHash });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

//end-rental endpoint
server.post('/end-rental/:tokenId', async (req, res) => {
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
      data: electricVehicleContract.methods.endRental(tokenId).encodeABI(),
    };

    const signedTx = await renterAccount.signTransaction(tx);
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    res.json({ success: true, message: 'Rental ended', txHash });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
