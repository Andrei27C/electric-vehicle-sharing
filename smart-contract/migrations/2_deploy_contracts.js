const ElectricVehicleToken = artifacts.require("ElectricVehicleToken");
const Bank = artifacts.require("Bank");
const VehicleManager = artifacts.require("VehicleManager");
const Rental = artifacts.require("Rental");

module.exports = async function (deployer, network, accounts) {

  // Deploy Bank contract
  await deployer.deploy(Bank);
  const bankInstance = await Bank.deployed();

  // Deploy ElectricVehicleToken contract
  await deployer.deploy(ElectricVehicleToken);
  const evTokenInstance = await ElectricVehicleToken.deployed();

  // Deploy VehicleManager contract
  await deployer.deploy(VehicleManager, evTokenInstance.address);
  const vehicleManagerInstance = await VehicleManager.deployed();

  // Set VehicleManager address in ElectricVehicleToken
  await evTokenInstance.updateVehicleManagerAddress(vehicleManagerInstance.address);

  // Deploy Rental contract
  await deployer.deploy(Rental, vehicleManagerInstance.address, bankInstance.address);
  const rentalInstance = await Rental.deployed();

  // Set Rental address in VehicleManager contract
  await vehicleManagerInstance.updateRentalAddress(rentalInstance.address);
  await bankInstance.updateRentalAddress(rentalInstance.address);
};
