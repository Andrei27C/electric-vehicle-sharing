const ElectricVehicle = artifacts.require("ElectricVehicle");

module.exports = function (deployer) {
  deployer.deploy(ElectricVehicle);
};
