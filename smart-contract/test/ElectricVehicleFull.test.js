const ElectricVehicle = artifacts.require('ElectricVehicle');
const truffleAssert = require('truffle-assertions');

contract('ElectricVehicle', function(accounts) {
  let contractInstance;
  const owner = accounts[0];
  const user1 = accounts[1];

  beforeEach(async function() {
    contractInstance = await ElectricVehicle.new({from: owner});
  });

  it('should deposit funds', async function() {
    await contractInstance.depositFunds({from: user1, value: web3.utils.toWei('1', 'ether')});

    let balance = await contractInstance.checkBalance({from: user1});
    assert.equal(balance.toString(), web3.utils.toWei('1', 'ether'));
  });

  it('should not withdraw funds more than the deposit', async function() {
    await truffleAssert.reverts(
      contractInstance.withdrawFunds(web3.utils.toWei('1', 'ether'), {from: user1}),
      'Insufficient balance'
    );
  });

  it('should withdraw funds', async function() {
    await contractInstance.depositFunds({from: user1, value: web3.utils.toWei('1', 'ether')});
    await contractInstance.withdrawFunds(web3.utils.toWei('0.5', 'ether'), {from: user1});

    let balance = await contractInstance.checkBalance({from: user1});
    assert.equal(balance.toString(), web3.utils.toWei('0.5', 'ether'));
  });

  it('should create a vehicle', async function() {
    await contractInstance.createVehicle(user1, "Tesla", "Model S", web3.utils.toWei('0.01', 'ether'), 10, {from: owner});

    let vehicle = await contractInstance.vehicles(0);
    assert.equal(vehicle.make, "Tesla");
    assert.equal(vehicle.model, "Model S");
  });

  it('should rent a vehicle', async function() {
    await contractInstance.createVehicle(user1, "Tesla", "Model S", web3.utils.toWei('0.01', 'ether'), 10, {from: owner});
    await contractInstance.depositFunds({from: user1, value: web3.utils.toWei('1', 'ether')});

    await contractInstance.rentVehicle(0, 5, {from: user1});

    let vehicle = await contractInstance.vehicles(0);
    assert.equal(vehicle.currentRenter, user1);
  });

  it('should end a rental', async function() {
    await contractInstance.createVehicle(user1, "Tesla", "Model S", web3.utils.toWei('0.01', 'ether'), 10, {from: owner});
    await contractInstance.depositFunds({from: user1, value: web3.utils.toWei('1', 'ether')});
    await contractInstance.rentVehicle(0, 5, {from: user1});

    await contractInstance.endRental(0, {from: user1});

    let vehicle = await contractInstance.vehicles(0);
    assert.equal(vehicle.currentRenter, '0x0000000000000000000000000000000000000000');
  });

  it('should withdraw income', async function() {
    await contractInstance.createVehicle(user1, "Tesla", "Model S", web3.utils.toWei('0.01', 'ether'), 10, {from: owner});
    await contractInstance.depositFunds({from: user1, value: web3.utils.toWei('1', 'ether')});
    await contractInstance.rentVehicle(0, 5, {from: user1});
    await contractInstance.endRental(0, {from: user1});

    let totalIncome = await contractInstance.totalRentalIncome();
    await contractInstance.withdrawIncome(totalIncome, {from: owner});

    totalIncome = await contractInstance.totalRentalIncome();
    assert.equal(totalIncome.toString(), '0');
  });
});
