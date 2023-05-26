const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

const web3 = new Web3(process.env.ETHER_RPC_WSS);

const electricVehicleJSON = JSON.parse(fs.readFileSync(path.join(__dirname, "../../smart-contract/build/contracts/ElectricVehicle.json"), "utf8"));
const electricVehicleABI = electricVehicleJSON.abi;
const electricVehicleAddress = electricVehicleJSON.networks["1337"].address;

console.log("ETHER_RPC_URL:", process.env.ETHER_RPC_WSS);
console.log("ElectricVehicleAddress:", electricVehicleAddress);

const electricVehicleContract = new web3.eth.Contract(electricVehicleABI, electricVehicleAddress);

module.exports = { web3, electricVehicleContract, electricVehicleABI, electricVehicleAddress };
