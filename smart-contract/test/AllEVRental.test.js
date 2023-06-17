const ElectricVehicleToken = artifacts.require('ElectricVehicleToken');
const VehicleManager = artifacts.require('VehicleManager');
const Bank = artifacts.require('Bank');
const Rental = artifacts.require('Rental');

contract('Comprehensive Vehicle Rental Tests', (accounts) => {
  let evToken, vm, bank, rental;
  const owner = accounts[0];
  const renter = accounts[1];

  before(async () => {
    bank = await Bank.new();
    evToken = await ElectricVehicleToken.new();
    vm = await VehicleManager.new(evToken.address);
    rental = await Rental.new(vm.address, bank.address);

    // Update rental contract address in Vehicle Manager
    await vm.updateRentalAddress(rental.address);
    // Update vehicle manager address in ElectricVehicleToken
    await evToken.updateVehicleManagerAddress(vm.address);
    // Update rental and vehicle manager addresses in Bank
    await bank.updateRentalAddress(rental.address);
  });

  it('should create vehicle', async () => {
    await vm.createVehicle('Make', 'Model', web3.utils.toWei('0.0001', 'ether'), { from: owner });
    const { make, model, pricePerHour } = await vm.getAllVehicleData(0);
    assert.equal(make, 'Make');
    assert.equal(model, 'Model');
    assert.equal(pricePerHour.toString(), web3.utils.toWei('0.0001', 'ether'));
  });

  it('should deposit funds to the bank', async () => {
    await bank.deposit({ from: renter, value: web3.utils.toWei('1', 'ether') });
    const balance = await bank.getBalance(renter);
    assert.equal(balance.toString(), web3.utils.toWei('1', 'ether'));
  });

  it('should not allow insufficient funds to rent', async () => {
    try {
      await bank.withdraw(web3.utils.toWei('1', 'ether'), { from: renter });
      const startTime = parseInt((Date.now() / 1000)); //parse to int and convert to seconds
      await rental.rentVehicle(0, startTime, { from: renter });
      assert.fail('Insufficient balance to rent this vehicle');
    } catch (error) {
      assert(error.message.includes('revert'), 'Expected "revert" but instead got: ' + error.message);
    }
  });

  it('should rent vehicle', async () => {
    await bank.deposit({ from: renter, value: web3.utils.toWei('1', 'ether') });
    const startTime = parseInt((Date.now() / 1000)); //parse to int and convert to seconds
    await rental.rentVehicle(0, startTime, { from: renter });
    const { currentRenter } = await vm.getAllVehicleData(0);
    assert.equal(currentRenter, renter);
  });

  it('should return vehicle', async () => {
    const endTime = parseInt((Date.now() / 1000) + 7200); // Assume rental lasted 2 hours
    await rental.returnVehicle(0, endTime, 100, { from: renter });
    const { currentRenter } = await vm.getAllVehicleData(0);
    assert.equal(currentRenter, owner);
    points = await evToken.balanceOfPoints(renter);
    assert.equal(points.toString(), '100');
  });

  it('should burn vehicle', async () => {
    await vm.deleteVehicle(0, { from: owner });
    const { active } = await vm.getAllVehicleData(0);
    assert.equal(active, false);
  });
});
