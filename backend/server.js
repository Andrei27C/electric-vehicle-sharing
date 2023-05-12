const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const server = express();

const fs = require('fs');
const path = require('path');

const ElectricVehicleJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../build/contracts/ElectricVehicle.json'), 'utf8'));
const ElectricVehicleABI = ElectricVehicleJSON.abi;
const ElectricVehicleAddress = ElectricVehicleJSON.networks['development'].address;
const electricVehicleContract = new web3.eth.Contract(ElectricVehicleABI, ElectricVehicleAddress);


const Web3 = require('web3');
const EV_ABI = require(path.join(__dirname, 'abis/ElectricVehicle.json'));

const web3 = new Web3(process.env.ETHER_RPC_URL);
const contractAddress = '0x03B4dd44C4F689E0251A2Ded7240A7364DBB0A4E';
const contract = new web3.eth.Contract(EV_ABI.abi, contractAddress);




server.use(cors());
server.use(express.json());

server.get('/', (req, res) => {
  res.send('EV Sharing API');
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
server.listen(PORT, HOST, () => {
  console.log(`Server running at ${HOST}:${PORT}`);
});

//get contract owner address
server.get('/contract-owner', async (req, res) => {
  try {
    const result = await contract.methods.getContractOwner().call();
    res.json({ success: true, ownerAddress: result[0], callerAddress: result[1] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

//dummy function
async function callDummyFunction() {
  const account = await getAccount();
  const result = await electricVehicleContract.methods.dummyFunction().send({ from: account });
  console.log(result);
}

callDummyFunction();

server.post('/callDummyFunction', async (req, res) => {
  try {

    const { account } = req.body;

    console.log(account.address);

    const contractInstance = new web3.eth.Contract(ElectricVehicleABI, contractAddress);

    const gasEstimate = await contractInstance.methods.dummyFunction().estimateGas({ from: account });
    const result = await contractInstance.methods.dummyFunction().send({ from: account, gas: gasEstimate });

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
  console.log(account.address);
  try {
    const gas = await contract.methods
      .mintVehicle(account.address, make, model, price)
      .estimateGas();
    const nonce = await web3.eth.getTransactionCount(account.address);

    const tx = {
      from: account.address,
      to: contractAddress,
      gas,
      nonce,
      data: contract.methods.mintVehicle(account.address, make, model, price).encodeABI(),
    };

    const signedTx = await account.signTransaction(tx);

    console.log('Signer address:', account.address);
    console.log('Raw transaction:', signedTx.rawTransaction);

    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    res.json({ success: true, message: 'Vehicle created', txHash });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

//vehicles get endpoint
server.get('/vehicles/:tokenId', async (req, res) => {
  const { tokenId } = req.params;

  try {
    const vehicleData = await contract.methods.getVehicleData(tokenId).call();
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
    const gas = await contract.methods
      .rentVehicle(tokenId, startTime, endTime)
      .estimateGas({ from: renterAccount.address });
    const nonce = await web3.eth.getTransactionCount(renterAccount.address);

    const tx = {
      from: renterAccount.address,
      to: contractAddress,
      gas,
      nonce,
      data: contract.methods.rentVehicle(tokenId, startTime, endTime).encodeABI(),
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
    const gas = await contract.methods
      .endRental(tokenId)
      .estimateGas({ from: renterAccount.address });
    const nonce = await web3.eth.getTransactionCount(renterAccount.address);

    const tx = {
      from: renterAccount.address,
      to: contractAddress,
      gas,
      nonce,
      data: contract.methods.endRental(tokenId).encodeABI(),
    };

    const signedTx = await renterAccount.signTransaction(tx);
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    res.json({ success: true, message: 'Rental ended', txHash });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
