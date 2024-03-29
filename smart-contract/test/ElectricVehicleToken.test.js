const ElectricVehicleToken = artifacts.require('ElectricVehicleToken');
const VehicleManager = artifacts.require('VehicleManager');
const Bank = artifacts.require('Bank');
const Rental = artifacts.require('Rental');

contract('Vehicle Rental Tests', (accounts) => {
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

  it('should rent vehicle', async () => {
    // Deposit ether to bank
    await bank.deposit({ from: renter, value: web3.utils.toWei('10', 'ether') });
    const startTime = parseInt((Date.now() / 1000)); //parse to int and convert to seconds
    await rental.rentVehicle(0, startTime, { from: renter });
    const vehicleData = await vm.getAllVehicleData(0);

    const { currentRenter } = vehicleData;
    assert.equal(currentRenter, renter);
  });

  it('should return vehicle', async () => {
    const { startTime } = await vm.getAllVehicleData(0);
    const endTime = parseInt(startTime.toString()) + 7200; // Assume rental lasted 2 hours
    await rental.returnVehicle(0, endTime, 100, { from: renter });
    const { currentRenter } = await vm.getAllVehicleData(0);
    assert.equal(currentRenter, owner);
  });

});
