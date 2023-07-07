const vManagerContractCalls = require("../contractInteractions/vehicleManagerContractController");
const Vehicle = require('../models/vehicle');


async function syncVehiclesFromContract() {
  const totalVehicles = await vManagerContractCalls.getTotalSupply();

  for (let i = 0; i < totalVehicles; i++) {
    const contractVehicle = await vManagerContractCalls.getAllVehicleData(i);

    // Check if vehicle exists in SQLite database
    Vehicle.getById(i, (err, dbVehicle) => {
      if (err) {
        console.error(err);
      } else if (dbVehicle) {
        // Existing vehicle, update it
        const updatedVehicle = new Vehicle(
          dbVehicle.id,
          contractVehicle.make,
          contractVehicle.model,
          contractVehicle.pricePerHour,
          contractVehicle.maxRentalHours,
          contractVehicle.startTime,
          contractVehicle.currentRenter,
          contractVehicle.active
        );
        updatedVehicle.update(err => {
          if (err) {
            console.error(err);
          } else {
            console.log(`Vehicle with ID ${i} updated`);
          }
        });
      } else {
        // New vehicle, create it
        const newVehicle = new Vehicle(
          i,
          contractVehicle.make,
          contractVehicle.model,
          contractVehicle.pricePerHour,
          contractVehicle.maxRentalHours,
          contractVehicle.startTime,
          contractVehicle.currentRenter,
          contractVehicle.active
        );
        newVehicle.save(err => {
          if (err) {
            console.error(err);
          } else {
            console.log(`New vehicle created with ID: ${i}`);
          }
        });
      }
    });
  }
}

module.exports = { syncVehiclesFromContract };
