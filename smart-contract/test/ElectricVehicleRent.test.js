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
    await contractInstance.mintVehicle(
      owner, "Make1", "Model1", web3.utils.toWei("1", "ether"), {from: owner});
    await contractInstance.mintVehicle(
      owner, "Make2", "Model2", web3.utils.toWei("2", "ether"), {from: owner});
  });

  it("rents a vehicle", async () => {
    const tokenId = 1;
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + 60 * 60; // 1 hour later
    const rentalFee = web3.utils.toWei("1", "ether"); // Assume 1 ether per hour
    console.log("asd");

    // Rent the vehicle
    await contractInstance.rentVehicle(tokenId, startTime, endTime, {from: renter, value: rentalFee});

    // Check the vehicle data
    const vehicle = await contractInstance._vehicleData(tokenId);
    console.log("THIS IS THE VEHICLE's START TIME: " + toDateTime(vehicle.startTime));
    console.log("THIS IS THE VEHICLE's END TIME: " + toDateTime(vehicle.endTime));
    console.log("THIS IS THE VEHICLE's APP ADDRESS: " + vehicle.appAddress);

    assert.equal(vehicle.startTime, startTime);
    assert.equal(vehicle.endTime, endTime);
    assert.equal(vehicle.appAddress, renter);
  });
});
