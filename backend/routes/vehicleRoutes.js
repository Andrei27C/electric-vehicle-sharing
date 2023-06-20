const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

router.delete('/delete-vehicle/:tokenId', vehicleController.deleteVehicle);

router.get('/get-vehicle/:tokenId', vehicleController.getVehicle);
router.post('/create-vehicle', vehicleController.createVehicle);
router.get('/get-vehicles-data-for-view/:userId', vehicleController.getVehicleDataForViewByUserId);
router.get('/contract-owner', vehicleController.getContractOwner);
module.exports = router;
