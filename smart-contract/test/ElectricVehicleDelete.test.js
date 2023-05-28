const ElectricVehicle = artifacts.require("ElectricVehicle");

contract("ElectricVehicle", accounts => {
  let instance;
  const owner = accounts[0];
  const user1 = accounts[1];

  before(async () => {
    instance = await ElectricVehicle.deployed();
  });

  it("should create a vehicle", async () => {
    await instance.createVehicle("Tesla", "Model 3", web3.utils.toWei("0.01", "ether"), {from: owner});
    const totalSupply = await instance.totalSupply.call();
    assert.equal(totalSupply.toNumber(), 1, "Total supply should be 1 after creation");
  });

  it("should fail when non-owner tries to delete a vehicle", async () => {
    try {
      await instance.deleteVehicle(0, {from: user1});
    } catch (err) {
      assert(err.message.indexOf("Ownable: caller is not the owner") >= 0, "Non-owner should not be able to delete a vehicle");
    }
  });

  it("should allow owner to delete a vehicle", async () => {
    await instance.deleteVehicle(0, {from: owner});
    const vehicleData = await instance.getAllVehicleData.call(0);
    assert.equal(vehicleData.active, false, "Vehicle should be inactive after deletion");
  });

  it("should fail when trying to rent a deleted vehicle", async () => {
    try {
      await instance.rentVehicle(0, {from: user1});
    } catch (err) {
      assert(err.message.indexOf("Vehicle is not active") >= 0, "Should not be able to rent a deleted vehicle");
    }
  });

  it("should fail when trying to delete a non-existent vehicle", async () => {
    try {
      await instance.deleteVehicle(2, {from: owner});
    } catch (err) {
      assert(err.message.indexOf("Vehicle does not exist") >= 0, "Should not be able to delete non-existent vehicle");
    }
  });

  it("should fail when trying to delete a vehicle that has already been deleted", async () => {
    try {
      await instance.deleteVehicle(0, {from: owner});
    } catch (err) {
      assert(err.message.indexOf("Vehicle is already deleted") >= 0, "Should not be able to delete a vehicle twice");
    }
  });
});
