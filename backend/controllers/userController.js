const { web3 } = require('../config/web3');
const dbQueries = require('../database/queries');
const exchange = require('../utils/exchangeRate');
const { convertWeiToUsd } = require("../utils/exchangeRate");
const bankContractCalls = require("../contractInteractions/bankContractController");
const vManagerContractCalls = require("../contractInteractions/vehicleManagerContractController");
const rentalContractCalls = require("../contractInteractions/rentalContractController");
const Vehicle = require("../models/vehicle");

const fundAccount = async (req, res) => {
  try {
    const userId = req.params.userId;
    const amountUSD = req.body.amount; // Amount to be funded
    let user = await dbQueries.getUserFromDBById(userId);
    const userAddress = user.address;

    const result =  await bankContractCalls.depositFunds(amountUSD, userAddress);
    // const result = await fundAccountData(userId, amount);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fund account',
    });
  }
};

const rent = async (req, res) => {
  console.log("---/rent-vehicle/:tokenId---");
  let userModelInstance = await dbQueries.getUserFromDBById(req.session.userId);
  //todo: send the private key from the app
  const renterPrivateKey = req.session.privateKey;
  const { tokenId } = req.params;

  if (!renterPrivateKey) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try{
    const resContract = await rentalContractCalls.rentVehicle(tokenId, renterPrivateKey);
    if(!resContract.success){
      return res.status(400).json({ success: false, message: resContract.message });
    }

    // Update user in db
    userModelInstance.vehicleId = parseInt(tokenId);
    await dbQueries.updateUserInDB(userModelInstance);

    // Update vehicle in db
    const contractVehicle = await vManagerContractCalls.getAllVehicleData(tokenId);
    Vehicle.getById(tokenId, (err, vehicle)=>{
      if(err){
        console.log(err);
      } else {
        const updatedVehicle = new Vehicle(
          vehicle.id,
          contractVehicle.make,
          contractVehicle.model,
          contractVehicle.pricePerHour,
          contractVehicle.maxRentalHours,
          contractVehicle.startTime,
          contractVehicle.currentRenter,
          contractVehicle.active
        );
        updatedVehicle.update((err)=>{
          if(err){
            console.log(err);
          } else {
            console.log("Vehicle updated in db");
          }
        });
      }
    })

    res.json({ success: true, message: "Vehicle rented", txHash: resContract.message });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
    console.log(error);
  }
};
const endRental = async (req, res) => {
  console.log("---/end-rental/:userId---");
  let userModelInstance = await dbQueries.getUserFromDBById(req.session.userId);
  const { userId } = req.params;
  const user = await dbQueries.getUserFromDBById(userId);
  const renterAccount = user.privateKey;
  try {
    const KILOMETERS_DRIVEN = 50;
    const vehicleId = (await getUserRentedVehicleData_FromContract(userId))?.vehicle?.id;
    const resContract = await rentalContractCalls.endRental(vehicleId, KILOMETERS_DRIVEN, renterAccount);
    if(!resContract.success){
      return res.status(400).json({ success: false, message: "Insufficient funds" });
    }
    // Update user in db
    userModelInstance.vehicleId = (resContract === true) ? null : userModelInstance.vehicleId;
    await dbQueries.updateUserInDB(userModelInstance);

    // Update vehicle in db
    const contractVehicle = await vManagerContractCalls.getAllVehicleData(vehicleId);
    Vehicle.getById(vehicleId, (err, vehicle)=>{
      if(err){
        console.log(err);
      } else {

        const updatedVehicle = new Vehicle(
          vehicle.id,
          contractVehicle.make,
          contractVehicle.model,
          contractVehicle.pricePerHour,
          contractVehicle.maxRentalHours,
          null,
          contractVehicle.currentRenter,
          contractVehicle.active
        );
        updatedVehicle.update(err => {
          if (err) {
            console.error(err);
          } else {
            console.log(`Vehicle with ID ${vehicle.id} updated`);
          }
        });
      }
    })

    res.json({ success: true, message: "Rental ended", resContract });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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
    if(res)
      return { vehicle: {
          id: res.id,
          make: res.vehicle.make,
          model: res.vehicle.model,
          pricePerHour: res.vehicle.pricePerHour,
          maxRentalHours: res.vehicle.maxRentalHours,
          startTime: res.vehicle.startTime,
          currentRenter: res.vehicle.currentRenter
        }};
    else
      return { vehicle: null };
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
      result.vehicle.pricePerHour = (await convertWeiToUsd(result.vehicle.pricePerHour)).toNumber();
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
  endRental,
  rent,
  getUserFundsWei,
  getUserPoints,
  getUser,
  getUserFundsData_FromContract,
  getUserPointsData,
  getUserData,
  getUserRentedVehicle,
  getUserRentedVehicleData_FromContract,
  getUserFundsDollars
};
