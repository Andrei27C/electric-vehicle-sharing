const { exchange } = require("../utils/exchangeRate");
const { epochSecondsToDateTime } = require("../utils/timeConverter");
const { getUserFromDBById, updateUserInDB } = require("../database/queries");
const dbQueries = require("../database/queries");
const { userModelInstance } = require("../models/user");
const { getUserRentedVehicleData_FromContract } = require("./userController");
const vManagerContractCalls = require("../contractInteractions/vehicleManagerContractController");


const createVehicle = async (req, res) => {
  console.log("-----/create-vehicle-----");

  const { userId, make, model, pricePerHour: pricePerHourUSD } = req.body;

  const dbAccount = await getUserFromDBById(userId);
  const privateKey = dbAccount.privateKey;
  const role = dbAccount.role;
  if (role !== "admin") {
    console.log("  Forbidden! You are not the owner.");
    return res.status(403).json({ message: "Forbidden! You are not the owner." });
  }
  const pricePerHourWei = await exchange.convertUsdToWei(pricePerHourUSD);
  console.log("  rentalFeeWeiPerHour:", pricePerHourWei);
  try{
    const resContract = await vManagerContractCalls.callContractCreateVehicle(make, model, pricePerHourWei, privateKey);
    if(!resContract.success){
      return res.status(400).json({ success: false, message: resContract.message });
    }
    //todo: save the vehicle in the db
    res.json({ success: true, message: "Vehicle created", txHash: resContract.txHash });
  }catch (error) {
    console.error("Failed to create vehicle:", error);
    res.status(500).json({ success: false, message: "Failed to create vehicle" });
  }
};
const rentVehicle = async (req, res) => {
  console.log("---/rent-vehicle/:tokenId---");
  //todo: send the private key from the app
  const renterPrivateKey = userModelInstance.privateKey;
  const { tokenId } = req.params;

  if (!renterPrivateKey) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try{
    const resContract = await vManagerContractCalls.callContractRentVehicle(tokenId, renterPrivateKey);
    if(!resContract.success){
      return res.status(400).json({ success: false, message: resContract.message });
    }

    // Update user in db
    userModelInstance.vehicleId = tokenId;
    await updateUserInDB(userModelInstance);

    res.json({ success: true, message: "Vehicle rented", txHash: resContract.message });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
    console.log(error);
  }
};
const endRental = async (req, res) => {
  console.log("---/end-rental/:userId---");

  const { userId } = req.params;
  console.log("userId: ", userId);
  const user = await dbQueries.getUserFromDBById(userId);
  console.log("user: ", user);
  const renterAccount = user.privateKey;
  console.log("renterAccount: ", renterAccount);
  try {
    const KILOMETERS_DRIVEN = 50;
    const vehicleId = (await getUserRentedVehicleData_FromContract(userId))?.vehicle?.id;
    const receipt = await vManagerContractCalls.callContractEndRental(vehicleId, KILOMETERS_DRIVEN, renterAccount);

    // Update user in db
    userModelInstance.vehicleId = (receipt === true) ? null : userModelInstance.vehicleId;
    console.log("       ------vehicleId ", userModelInstance.vehicleId);
    await updateUserInDB(userModelInstance);

    res.json({ success: true, message: "Rental ended", receipt });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const deleteVehicle = async (req, res) => {
  console.log("---/delete-vehicle/:tokenId---");

  // Only the owner of the contract (admin role) can delete a vehicle
  const adminPrivateKey = process.env.TD_DEPLOYER_PRIVATE_KEY;
  const { tokenId } = req.params;
  if (!adminPrivateKey) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  console.log("  Input parameters:", { tokenId, adminPrivateKey });

  try {
    const resContract = await vManagerContractCalls.callContractDeleteVehicle(tokenId, adminPrivateKey);
    if(!resContract.success){
      return res.status(400).json({ success: false, message: resContract.message });
    }
    //todo delete veh from db

    res.json({ success: true, message: "Vehicle deleted", txHash: resContract.message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
    console.log(error);
  }
};
//get one vehicle by id
const getVehicle = async (req, res) => {
  console.log("Calling get vehicle endpoint...");
  const { tokenId } = req.params;
  console.log("  Input parameters:", { tokenId });
  try {
    const vehicleData = await vManagerContractCalls.callContractGetAllVehicleData(tokenId);
    // console.log("vehicleData:", vehicleData);
    const vehicle = {
      tokenId, make: vehicleData.make, model: vehicleData.model, pricePerHour: vehicleData.pricePerHour
    };
    res.json({ success: true, vehicle });
  } catch (error) {
    console.log("Error fetching vehicle:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
// methods for getting the right data of the vehicles for user or owner screen
const getPreparedForFrontendVehicleData = async (vehicleId) => {
  const vehicle = await vManagerContractCalls.callContractGetAllVehicleData(vehicleId);

  // Prepare data for frontend
  vehicle.pricePerHour = await exchange.convertWeiToUsd(vehicle.pricePerHour);
  vehicle.pricePerHour = parseFloat(vehicle.pricePerHour).toFixed(2);
  vehicle.startTime = epochSecondsToDateTime(vehicle.startTime);

  return vehicle;
};
const getVehiclesDataForViewOnly = async (ownerScreen) => {
  const totalSupply = await vManagerContractCalls.callContractGetTotalSupply();
  const contractOwner = await vManagerContractCalls.getOwner();
  const vehicles = [];

  for (let i = 0; i < totalSupply; i++) {
    const vehicle = await getPreparedForFrontendVehicleData(i);
    console.log("    vehicle:", vehicle);

    // for user screen we need only active vehicles that are not rented by the user
    if(!ownerScreen) {
      if (vehicle.active === true && vehicle.currentRenter === contractOwner) {
        console.log("    entered here");
        vehicles.push({
          tokenId: i,
          make: vehicle.make,
          model: vehicle.model,
          pricePerHour: vehicle.pricePerHour,
          maxRentalHours: vehicle.maxRentalHours,
          startTime: vehicle.startTime,
        });
      }
    }
    // for owner screen we need all information about the vehicle
    else
    {

      if(vehicle.currentRenter === contractOwner)
        vehicle.currentRenter = "Owner";
      vehicles.push({
        tokenId: i,
        make: vehicle.make,
        model: vehicle.model,
        pricePerHour: vehicle.pricePerHour,
        maxRentalHours: vehicle.maxRentalHours,
        startTime: vehicle.startTime,
        currentRenter: vehicle.currentRenter,
        active: vehicle.active
      });
    }

  }
  return vehicles;
};
const getVehicleDataForViewByUserId = async (req, res) => {
  console.log("-----/get-vehicles-data-for-view-----");
  const userId = req.params.userId;
  try {
    const dbUser = await dbQueries.getUserFromDBById(userId);
    console.log("    dbUser:", dbUser)
    let ownerScreen = false;
    if(dbUser.role === "admin")
      ownerScreen = true;
    console.log("    ownerScreen:", ownerScreen)
    const vehicles = await getVehiclesDataForViewOnly(ownerScreen);
    res.json({ success: true, vehicles });
  } catch (error) {
    console.error("Failed to fetch vehicles:", error);
    res.status(500).json({ success: false, message: "Failed to fetch vehicles" });
  }
};


//todo resolve this, see where to put it
//get contract owner address
const getContractOwner = async (req, res) => {
  console.log("-----/contract-owner-----");
  try {
    const owner = await vManagerContractCalls.getOwner();
    console.log("   owner:", owner);
    res.send({ owner });
  } catch (error) {
    console.log("   Failed to fetch owner address:", error);
    res.status(500).send({ error: "Failed to fetch owner address" });
  }
}

module.exports = {
  deleteVehicle,
  endRental,
  rentVehicle,
  createVehicle,
  getVehicle,
  getVehicleDataForViewByUserId,
  getContractOwner
};
