const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Web3 = require('web3');

const server = express();

const ElectricVehicleJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../smart-contract/build/contracts/ElectricVehicle.json'), 'utf8'));
const ElectricVehicleABI = ElectricVehicleJSON.abi;
const ElectricVehicleAddress = ElectricVehicleJSON.networks['5777'].address;

const web3 = new Web3(process.env.ETHER_RPC_URL);
const electricVehicleContract = new web3.eth.Contract(ElectricVehicleABI, ElectricVehicleAddress);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

dotenv.config();

server.use(cors());
server.use(express.json());

server.get('/', (req, res) => {
  res.send('EV Sharing API');
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at ${HOST}:${PORT}`);
});

//get contract owner address
server.get('/contract-owner', async (req, res) => {
  try {
    const ownerAndSender = await electricVehicleContract.methods.ownerAddress().call();
    const ownerAddress = ownerAndSender[0];
    const senderAddress = ownerAndSender[1];

    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const contractOwner = await electricVehicleContract.methods.ownerAddress().call();


    res.json({ success: true, ownerAddress: contractOwner[0], senderAddress: account.address });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

server.post('/emit-owner-and-sender', async (req, res) => {
  try {
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const gas = await electricVehicleContract.methods.emitOwnerAndSender().estimateGas({ from: account.address });
    const nonce = await web3.eth.getTransactionCount(account.address);

    const tx = {
      from: account.address,
      to: electricVehicleContract.options.address,
      gas,
      nonce,
      data: electricVehicleContract.methods.emitOwnerAndSender().encodeABI(),
    };

    const signedTx = await account.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    // Find the OwnerAndSender event in the receipt
    const ownerAndSenderEvent = receipt.events.find(event => event.event === 'OwnerAndSender');
    const ownerAddress = ownerAndSenderEvent.returnValues.owner;
    const senderAddress = ownerAndSenderEvent.returnValues.sender;

    res.json({ success: true, ownerAddress, senderAddress });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

//dummy function
async function getAccount() {
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
}

async function callDummyFunction() {
  const account = await getAccount();
  const result = await electricVehicleContract.methods.dummyFunction().send({ from: account });
  console.log(result);
}

// callDummyFunction();
server.post('/callDummyFunction', async (req, res) => {
  try {
    const { account } = req.body;
    console.log(account.address);

    const gasEstimate = await electricVehicleContract.methods.dummyFunction().estimateGas({ from: account });
    const result = await electricVehicleContract.methods.dummyFunction().send({ from: account, gas: gasEstimate });

    res.json({ success: true, message: 'Dummy function called successfully', result });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

//vehicles endpoint
server.post('/vehicles', async (req, res) => {
  const { make, model, price } = req.body;
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  // const account = 0x0000000000000000000000000000000000000000;
  console.log(account.address);

  // console.log('Input parameters:', { make, model, price, accountAddress: account.address });

  let gas;
  try {
    const contractMethod = electricVehicleContract.methods.mintVehicle(account.address, make, model, price);
    // console.log('Contract method:', contractMethod);

    // gas = await contractMethod.estimateGas();
    gas = 500000;
  } catch (error) {
    console.error('Error estimating gas:', error.message);
    res.status(500).json({ success: false, message: 'Error estimating gas', error: error.message });
    return;
  }

  try {
    const nonce = await web3.eth.getTransactionCount(account.address);

    const tx = {
      from: account.address,
      to: electricVehicleContract.options.address,
      gas,
      nonce,
      data: electricVehicleContract.methods.mintVehicle(account.address, make, model, price).encodeABI(),
    };

    const signedTx = await account.signTransaction(tx);

    console.log('Signer address:', account.address);
    console.log('Raw transaction:', signedTx.rawTransaction);

    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    // console.log('Transaction Receipt:', txReceipt);

    // const debugMintVehicleEvent = txReceipt.events.DebugMintVehicle || txReceipt.events.find(event => event.event === 'DebugMintVehicle');

    // console.log('DebugMintVehicle event:', debugMintVehicleEvent.returnValues);

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
      owner: vehicleData.owner,
      make: vehicleData.make,
      model: vehicleData.model,
      price: vehicleData.price,
      rented: vehicleData.rented,
      rentalStartTime: vehicleData.rentalStartTime,
      rentalEndTime: vehicleData.rentalEndTime,
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
      to: contractAddress,
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
