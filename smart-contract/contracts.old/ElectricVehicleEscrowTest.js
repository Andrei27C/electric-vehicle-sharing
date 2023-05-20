const ElectricVehicle = artifacts.require('ElectricVehicle');
const Escrow = artifacts.require('Escrow');

contract('ElectricVehicle & Escrow', accounts => {
  let electricVehicle;
  let escrow;
  const owner = accounts[0];
  const renter = accounts[1];
  const tokenId = 1;

  beforeEach(async () => {
    const electricVehicle = await ElectricVehicle.new({ from: owner });
    escrow = await Escrow.new(electricVehicle.address);

    // Mint a vehicle
    await electricVehicle.mintVehicle(owner, 'Tesla', 'Model S', web3.utils.toWei('0.01', 'ether'));
  });

  it('should mint a vehicle', async () => {
    const vehicleMake = await electricVehicle.getVehicleData(tokenId);
    assert.equal(vehicleMake, 'Tesla');
  });

  it('should start rental', async () => {
    const startTime = Math.floor(Date.now() / 1000);  // Now in UNIX timestamp
    const endTime = startTime + 3600;  // One hour from now

    await escrow.startRental(tokenId, startTime, endTime, {from: renter});

    const vehicleRenter = await electricVehicle.getOwner(tokenId);
    assert.equal(vehicleRenter, renter);
  });

  it('should end rental', async () => {
    await escrow.endRental(tokenId, {
      from: renter,
      value: web3.utils.toWei('0.01', 'ether'), // The cost of rental
    });

    const vehicleRenter = await electricVehicle.getOwner(tokenId);
    assert.equal(vehicleRenter, owner);
  });

  it('should withdraw funds', async () => {
    const initialBalance = await web3.eth.getBalance(owner);

    await escrow.withdraw({
      from: owner
    });

    const finalBalance = await web3.eth.getBalance(owner);
    assert(finalBalance > initialBalance);
  });
});

