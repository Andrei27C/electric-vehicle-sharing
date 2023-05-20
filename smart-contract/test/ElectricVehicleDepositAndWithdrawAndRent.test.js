const ElectricVehicle = artifacts.require('ElectricVehicle');
const truffleAssert = require('truffle-assertions');

contract('ElectricVehicle', function(accounts) {
  let contractInstance;
  const owner = accounts[0];
  const user1 = accounts[1];

  beforeEach(async function() {
    contractInstance = await ElectricVehicle.new({from: owner});
  });

  it('User should be able to deposit funds', async function() {
    let initialBalance = await contractInstance.checkBalance({from: user1});
    assert.equal(initialBalance, 0);

    await contractInstance.depositFunds({from: user1, value: web3.utils.toWei('1', 'ether')});

    let finalBalance = await contractInstance.checkBalance({from: user1});
    assert.equal(finalBalance, web3.utils.toWei('1', 'ether'));
  });

  it('User should be able to withdraw funds', async function() {
    await contractInstance.depositFunds({from: user1, value: web3.utils.toWei('1', 'ether')});
    await contractInstance.withdrawFunds(web3.utils.toWei('0.5', 'ether'), {from: user1});

    let finalBalance = await contractInstance.checkBalance({from: user1});
    assert.equal(finalBalance, web3.utils.toWei('0.5', 'ether'));
  });

  it('User should not be able to withdraw more funds than they have', async function() {
    await truffleAssert.reverts(
      contractInstance.withdrawFunds(web3.utils.toWei('1', 'ether'), {from: user1}),
      'Insufficient balance'
    );
  });

  it('User should be able to rent a vehicle if they have enough balance', async function() {
    await contractInstance.depositFunds({from: user1, value: web3.utils.toWei('1', 'ether')});
    await contractInstance.createVehicle(user1, "Tesla", "Model S", web3.utils.toWei('0.01', 'ether'), 10, {from: owner});

    let tokenId = 0;  // use the correct tokenId here
    let rentalHours = 5;

    await contractInstance.rentVehicle(tokenId, rentalHours, {from: user1});

    let vehicle = await contractInstance.vehicles(tokenId);
    assert.equal(vehicle.currentRenter, user1);
  });

  it('User should not be able to rent a vehicle if they do not have enough balance', async function() {
    await contractInstance.createVehicle(user1, "Tesla", "Model S", web3.utils.toWei('0.01', 'ether'), 10, {from: owner});

    let tokenId = 0;  // use the correct tokenId here
    let rentalHours = 5;

    await truffleAssert.reverts(
      contractInstance.rentVehicle(tokenId, rentalHours, {from: user1}),
      'Insufficient balance to rent this vehicle'
    );
  });

});
