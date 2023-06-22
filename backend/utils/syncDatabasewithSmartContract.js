const vManagerContractCalls = require("../contractInteractions/vehicleManagerContractController");
const Vehicle = require('../models/vehicle');


async function syncVehiclesFromContract() {
  const totalVehicles = await vManagerContractCalls.getTotalSupply();

  for (let i = 0; i < totalVehicles; i++) {
    const contractVehicle = await vManagerContractCalls.getAllVehicleData(i);

    // Check if vehicle exists in SQLite database
    Vehicle.getById(i, (err, vehicle) => {
      if (vehicle) {
        // Update existing vehicle
        vehicle.make = contractVehicle.make;
        vehicle.model = contractVehicle.model;
        vehicle.pricePerHour = contractVehicle.pricePerHour;
        vehicle.maxRentalHours = contractVehicle.maxRentalHours;
        vehicle.startTime = contractVehicle.startTime;
        vehicle.currentRenter = contractVehicle.currentRenter;
        vehicle.active = contractVehicle.active;
        vehicle.update((err) => {
          if (err) {
            console.error(err);
          } else {
            console.log(`Vehicle with ID ${i} updated`);
          }
        });
      } else {
        // Insert new vehicle
        const newVehicle = new Vehicle(i, contractVehicle.make, contractVehicle.model, contractVehicle.pricePerHour, contractVehicle.maxRentalHours, contractVehicle.startTime, contractVehicle.currentRenter, contractVehicle.active);
        newVehicle.save((err, id) => {
          if (err) {
            console.error(err);
          } else {
            console.log(`New vehicle created with ID: ${id}`);
          }
        });
      }
    });
  }
}

module.exports = { syncVehiclesFromContract };
