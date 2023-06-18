const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

router.delete('/delete-vehicle/:tokenId', vehicleController.deleteVehicle);
router.post('/end-rental/:userId', vehicleController.endRental);
router.post('/rent-Vehicle/:tokenId', vehicleController.rentVehicle);
router.get('/get-vehicle/:tokenId', vehicleController.getVehicle);
router.post('/create-vehicle', vehicleController.createVehicle);
router.post('/get-vehicles-data-for-view/:userId', vehicleController.getVehicleDataForViewByUserId);

module.exports = router;
