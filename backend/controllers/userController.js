const { web3, electricVehicleContract } = require('../config/web3');
const dbQueries = require('../database/queries');
const exchange = require('../utils/exchangeRate');

const fundAccount = async (req, res) => {
  console.log("---/fund-account/:userId---");
  try {
    const userId = req.params.userId;
    console.log(    userId);
    const amount = req.body.amount; // Amount to be funded

    let user = await dbQueries.getUserFromDBById(userId);
    console.log(user);
    const userAddress = user.address;

    const gasPrice = await web3.eth.getGasPrice();

    let gasEstimate;
    // await electricVehicleContract.methods.depositFunds().estimateGas({
    //   from: userAddress,
    //   value: web3.utils.toWei(amount, 'ether')
    // });
    gasEstimate = 5000000;

    const result = await electricVehicleContract.methods.depositFunds().send({
      from: userAddress,
      gas: gasEstimate,
      gasPrice: gasPrice,
      value: web3.utils.toWei(amount, 'ether')
    });

    res.json({
      success: true,
      funds: result.events.FundsDeposited.returnValues.amount,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fund account',
    });
  }
};

const getUserFunds = async (req, res) => {
  const { userId } = req.params;

  //todo get user address from db
  let user = await dbQueries.getUserFromDBById(userId);
  const address = user.address;

  try {
    const balance = await electricVehicleContract.methods.checkBalance().call({from: address});
    console.log("balance:" + balance);

    let fundsEther = web3.utils.fromWei(balance, 'ether');

    let ethToUsdRate = await exchange.getEthToUsdRate();
    let fundsDollars = ethToUsdRate * fundsEther;

    console.log("fundsDollars:" + fundsDollars);

    res.json({ funds: balance, fundsDollars: fundsDollars.toString() });
  } catch(err) {
    console.log(err);
    res.status(500).send('An error occurred while fetching balance');
  }};


const getUserPoints = async (req, res) => {
  console.log("---/get-user-points/:userId---");

  const { userId } = req.params;
  try {
    const { userId } = req.params;
    // Use the contract's balanceOf method to fetch the user's points
    const points = await electricVehicleContract.methods.getPoints().call();
    res.json({ points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUser = async (req, res) => {
  console.log("---/user/:userId---");
  try {
    const userId  = req.params.userId;
    let user = await dbQueries.getUserFromDBById(userId);
    res.json({ user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  fundAccount,
  getUserFunds,
  getUserPoints,
  getUser
};
