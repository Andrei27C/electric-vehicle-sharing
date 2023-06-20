const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

const web3 = new Web3(process.env.ETHER_RPC_WSS);

const gasPrice = process.env.GAS_PRICE;
const gasLimit = process.env.GAS_LIMIT;

const bankContractJSON = JSON.parse(fs.readFileSync(path.join(__dirname, "../../smart-contract/build/contracts/Bank.json"), "utf8"));
const vehicleManagerContractJSON = JSON.parse(fs.readFileSync(path.join(__dirname, "../../smart-contract/build/contracts/VehicleManager.json"), "utf8"));
const rentalContractJSON = JSON.parse(fs.readFileSync(path.join(__dirname, "../../smart-contract/build/contracts/Rental.json"), "utf8"));

const bankContractABI = bankContractJSON.abi;
const vehicleManagerContractABI = vehicleManagerContractJSON.abi;
const rentalContractABI = rentalContractJSON.abi;

const bankContractAddress = bankContractJSON.networks["1337"].address;
const vehicleManagerContractAddress = vehicleManagerContractJSON.networks["1337"].address;
const rentalContractAddress = rentalContractJSON.networks["1337"].address;

const bankContract = new web3.eth.Contract(bankContractABI, bankContractAddress);
const vehicleManagerContract = new web3.eth.Contract(vehicleManagerContractABI, vehicleManagerContractAddress);
const rentalContract = new web3.eth.Contract(rentalContractABI, rentalContractAddress);

// const electricVehicleJSON = JSON.parse(fs.readFileSync(path.join(__dirname, "../../smart-contract/build/contracts/ElectricVehicle.json"), "utf8"));
// const electricVehicleABI = electricVehicleJSON.abi;
// const electricVehicleAddress = electricVehicleJSON.networks["1337"].address;
// const electricVehicleContract = new web3.eth.Contract(electricVehicleABI, electricVehicleAddress);

console.log("ETHER_RPC_URL:", process.env.ETHER_RPC_WSS);
console.log("BankContractAddress:", bankContractAddress);
console.log("VehicleManagerContractAddress:", vehicleManagerContractAddress);
console.log("RentalContractAddress:", rentalContractAddress);
// console.log("ElectricVehicleAddress:", electricVehicleAddress);


module.exports = {
  web3,
  bankContract,
  bankContractABI,
  bankContractAddress,
  vehicleManagerContract,
  vehicleManagerContractABI,
  vehicleManagerContractAddress,
  rentalContract,
  rentalContractABI,
  rentalContractAddress,
  gasPrice,
  gasLimit
};

// module.exports = { web3, electricVehicleContract, electricVehicleABI, electricVehicleAddress };
