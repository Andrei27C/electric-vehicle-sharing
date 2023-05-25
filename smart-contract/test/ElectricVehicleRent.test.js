const ElectricVehicle = artifacts.require("ElectricVehicle");

function toDateTime(secs) {
  var t = new Date(1970, 0, 1); // Epoch
  t.setSeconds(secs);
  return t;
}

contract("ElectricVehicle", accounts => {
  let contractInstance;
  const owner = accounts[0];
  console.log("Owner address: ", owner);
  const renter = accounts[1];
  console.log("Renter address: ", renter);

  before(async () => {
    contractInstance = await ElectricVehicle.deployed();
    console.log("Contract deployed at address: ", contractInstance.address);
    // Mint two vehicles
    await contractInstance.createVehicle(
      "Make1", "Model1", web3.utils.toWei("0.01", "ether"), {from: owner});
    await contractInstance.createVehicle(
      "Make2", "Model2", web3.utils.toWei("0.02", "ether"), {from: owner});
  });

  it("rents a vehicle", async () => {

    await contractInstance.depositFunds({from: renter, value: web3.utils.toWei('1', 'ether')});
    let finalBalance = await contractInstance.checkBalance({from: renter});
    console.log("final balance: " + finalBalance);

    // // Rent the vehicle
    await contractInstance.rentVehicle(0, {from: renter});
    //
    // // Check the vehicle data
    // const vehicle = await contractInstance.vehicles(tokenId);
    // console.log("THIS IS THE VEHICLE's START TIME: " + toDateTime(vehicle.startTime));
    // // console.log("THIS IS THE VEHICLE's END TIME: " + toDateTime(vehicle.endTime));
    // console.log("THIS IS THE VEHICLE's APP ADDRESS: " + vehicle.currentRenter);
    //
    // assert.equal(vehicle.startTime, startTime);
    // // assert.equal(vehicle.endTime, endTime);
    // assert.equal(vehicle.currentRenter, renter);
  });
});
