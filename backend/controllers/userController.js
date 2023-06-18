const { web3 } = require('../config/web3');
const dbQueries = require('../database/queries');
const exchange = require('../utils/exchangeRate');
const { convertWeiToUsd } = require("../utils/exchangeRate");
const bankContractCalls = require("../contractInteractions/bankContractController");
const vManagerContractCalls = require("../contractInteractions/vehicleManagerContractController");

const fundAccountData = async (userId, amount) => {
  let user = await dbQueries.getUserFromDBById(userId);
  const userAddress = user.address;

  return await bankContractCalls.depositFunds(amount, userAddress);
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
  let user = await dbQueries.getUserFromDBById(userId);
  const points = await vManagerContractCalls.getPoints(user.address);
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

const getUserFundsData_FromContract = async (userId) => {
  let user = await dbQueries.getUserFromDBById(userId);
  const address = user.address;

  const balance = await bankContractCalls.getUserFunds(address);
  // console.log("----user funds in wei: ", balance);
  let fundsEther = web3.utils.fromWei(balance, 'ether');

  let ethToUsdRate = await exchange.getEthToUsdRate();
  let fundsDollars = ethToUsdRate * fundsEther;

  return { funds: balance, fundsDollars: fundsDollars.toString() };
};
const getUserFundsWei = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await getUserFundsData_FromContract(userId);
    res.json(result);
  } catch(err) {
    console.log(err);
    res.status(500).send('An error occurred while fetching balance');
  }
};
const getUserFundsDollars = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await convertWeiToUsd(getUserFundsData_FromContract(userId));
    res.json(result);
  } catch(err) {
    console.log(err);
    res.status(500).send('An error occurred while fetching balance');
  }
};

const getUserRentedVehicleData_FromContract = async (userId) => {
  try {
    let user = await dbQueries.getUserFromDBById(userId);
    const address = user.address;
    console.log("address:------" , address);
    const res = await vManagerContractCalls.getVehicleByAddress(address);

    return { vehicle: {
        id: res.id,
        make: res.vehicle.make,
        model: res.vehicle.model,
        pricePerHour: res.vehicle.pricePerHour,
        maxRentalHours: res.vehicle.maxRentalHours,
        startTime: res.vehicle.startTime,
        currentRenter: res.vehicle.currentRenter
      }};
  } catch (error) {
    // console.error(error);
    return { vehicle: null };
  }
};
const getUserRentedVehicle = async (req, res) => {
  console.log("---/get-rented-vehicle/:userId---");

  const { userId } = req.params;
  try {
    const result = await getUserRentedVehicleData_FromContract(userId);
    if(result.vehicle != null) {
      result.vehicle.pricePerHour = await convertWeiToUsd(result.vehicle.pricePerHour);
    }

    // console.log("result:------" , result);
    res.json(result);
  } catch(err) {
    // console.log(err);
    res.status(500).send('An error occurred while fetching balance');
  }
};

module.exports = {
  fundAccount,
  getUserFundsWei,
  getUserPoints,
  getUser,
  fundAccountData,
  getUserFundsData_FromContract,
  getUserPointsData,
  getUserData,
  getUserRentedVehicle,
  getUserRentedVehicleData_FromContract,
  getUserFundsDollars
};
