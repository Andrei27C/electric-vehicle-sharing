import { before } from "truffle/build/4722.bundled";
import { it } from "truffle/build/7337.bundled";

const VehicleManager = artifacts.require('VehicleManager');
const ElectricVehicleToken = artifacts.require('ElectricVehicleToken');

contract('VehicleManager', (accounts) => {
  let vehicleManager = null;
  let evToken = null;
  const owner = accounts[0];
  const renter = accounts[1];

  before(async () => {
    evToken = await ElectricVehicleToken.new();
    vehicleManager = await VehicleManager.new(evToken.address);
  });

  it('Creates a new vehicle', async () => {
    await vehicleManager.createVehicle('Tesla', 'Model S', 10, { from: owner });
    const vehicle = await vehicleManager.getAllVehicleData(0);
    assert(vehicle[0] === 'Tesla');
    assert(vehicle[1] === 'Model S');
    assert(vehicle[2].toString() === '10');
    assert(vehicle[5] === owner);
    assert(vehicle[6] === true);
  });

  it('Rent a vehicle', async () => {
    // Assume balance of renter is sufficient and renter has been approved
    await evToken.setApprovalForAll(vehicleManager.address, true, { from: renter });

    await vehicleManager.rentVehicle(0, { from: renter });
    const vehicle = await vehicleManager.getAllVehicleData(0);
    assert(vehicle[5] === renter); // Check renter
    assert(vehicle[4].toString() !== '0'); // Check start time
  });

  it('Ends the rental', async () => {
    const startTime = (await vehicleManager.getAllVehicleData(0))[4];
    const endTime = startTime.add(web3.utils.toBN(3600)); // One hour later
    const initialTax = web3.utils.toBN(0); // Assume no initial tax
    const kilometersDriven = web3.utils.toBN(10); // Assume 10 kilometers driven

    await vehicleManager.endRental(0, endTime, initialTax, kilometersDriven, { from: renter });
    const vehicle = await vehicleManager.getAllVehicleData(0);
    assert(vehicle[5] === owner); // Check owner
    assert(vehicle[4].toString() === '0'); // Check start time
  });

  it('Delete a vehicle', async () => {
    await vehicleManager.deleteVehicle(0, { from: owner });
    const vehicle = await vehicleManager.getAllVehicleData(0);
    assert(vehicle[6] === false); // Check active status
  });

  it('Fails to rent a deleted vehicle', async () => {
    try {
      await vehicleManager.rentVehicle(0, { from: renter });
      assert.fail();
    } catch (err) {
      assert.ok(/Vehicle is not active/.test(err.toString()));
    }
  });

  it('Fails to rent a vehicle with insufficient balance', async () => {
    try {
      await vehicleManager.rentVehicle(0, { from: accounts[2] }); // Assume insufficient balance
      assert.fail();
    } catch (err) {
      assert.ok(/Insufficient balance to rent this vehicle/.test(err.toString()));
    }
  });

  it('Fails to end rental by non-renter', async () => {
    try {
      await vehicleManager.endRental(0, 0, 0, 0, { from: accounts[2] }); // Non-renter tries to end rental
      assert.fail();
    } catch (err) {
      assert.ok(/You are not the current renter of this vehicle/.test(err.toString()));
    }
  });
});
