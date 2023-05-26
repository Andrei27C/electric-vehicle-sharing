const { web3, electricVehicleContract } = require('../config/web3');
const dbQueries = require('../database/queries');
const exchange = require('../utils/exchangeRate');


const fundAccountData = async (userId, amount) => {
  let user = await dbQueries.getUserFromDBById(userId);
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

  return {
    success: true,
    funds: result.events.FundsDeposited.returnValues.amount,
  };
};

const fundAccount = async (req, res) => {
  try {
    const userId = req.params.userId;
    const amount = req.body.amount; // Amount to be funded
    const result = await fundAccountData(userId, amount);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fund account',
    });
  }
};

const getUserPointsData = async (userId) => {
  // Use the contract's balanceOf method to fetch the user's points
  const points = await electricVehicleContract.methods.getPoints().call();
  return { points };
};

const getUserPoints = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await getUserPointsData(userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserData = async (userId) => {
  let user = await dbQueries.getUserFromDBById(userId);
  return { user };
};

const getUser = async (req, res) => {
  try {
    const userId  = req.params.userId;
    const result = await getUserData(userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserFundsData = async (userId) => {
  let user = await dbQueries.getUserFromDBById(userId);
  const address = user.address;

  const balance = await electricVehicleContract.methods.checkBalance().call({from: address});

  let fundsEther = web3.utils.fromWei(balance, 'ether');

  let ethToUsdRate = await exchange.getEthToUsdRate();
  let fundsDollars = ethToUsdRate * fundsEther;

  return { funds: balance, fundsDollars: fundsDollars.toString() };
};

const getUserFunds = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await getUserFundsData(userId);
    res.json(result);
  } catch(err) {
    console.log(err);
    res.status(500).send('An error occurred while fetching balance');
  }
};

module.exports = {
  fundAccount,
  getUserFunds,
  getUserPoints,
  getUser,
  fundAccountData,
  getUserFundsData,
  getUserPointsData,
  getUserData,
};
