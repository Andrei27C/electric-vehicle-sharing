const ElectricVehicle = artifacts.require("ElectricVehicle");
const BN = web3.utils.BN;

contract("ElectricVehicle", accounts => {
  let instance;
  const owner = accounts[0];
  const user = accounts[1];

  beforeEach(async () => {
    instance = await ElectricVehicle.new({ from: owner });
  });

  it("Should add points to user after endRental", async () => {
    // Call the depositFunds() function to add some balance to user
    await instance.depositFunds({from: user, value: web3.utils.toWei("10", "ether")});

    // Assume that you've created a vehicle with tokenId = 1
    const tokenId = 0;
    const vehicleMake = "TestMake";
    const vehicleModel = "TestModel";
    const pricePerHour = new BN(1);
    await instance.createVehicle(vehicleMake, vehicleModel, pricePerHour, {from: owner});

    // Rent the vehicle
    await instance.rentVehicle(tokenId, {from: user});

    const initialTax = new BN(0);
    const kilometersDriven = new BN(10);
    const endTime = (await web3.eth.getBlock("latest")).timestamp;

    // End the rental
    await instance.endRental(tokenId, endTime, initialTax, kilometersDriven, {from: user});

    // Check the balance of POINTS_TOKEN_ID for the user
    const userPoints = await instance.balanceOf(user, 0);
    const getPointsResult = await instance.getPoints({from: user});
    assert.equal(getPointsResult.toString(), kilometersDriven.toString(), "Points balance not correctly updated after endRental using getPoints");
    assert.equal(userPoints.toString(), kilometersDriven.toString(), "Points balance not correctly updated after endRental");
  });
});
