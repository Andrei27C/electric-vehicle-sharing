const Web3 = require('web3');
const web3 = new Web3(process.env.INFURA_URL);
const contractABI = require('../abis/ElectricVehicle.json');
const contractAddress = process.env.CONTRACT_ADDRESS;

const getAllVehicles = async () => {
  const contract = new web3.eth.Contract(contractABI, contractAddress);
  const totalSupply = await contract.methods.totalSupply().call();
  const vehicles = [];

  for (let i = 0; i < totalSupply; i++) {
    const tokenId = await contract.methods.tokenByIndex(i).call();
    const vehicle = await contract.methods.vehicles(tokenId).call();
    vehicles.push({
      tokenId,
      make: vehicle.make,
      model: vehicle.model,
      price: web3.utils.fromWei(vehicle.price, 'ether'),
    });
  }

  return vehicles;
};

module.exports = {
  getAllVehicles,
};
