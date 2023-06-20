const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');

//for vehicles
router.delete('/delete-vehicle/:tokenId', ownerController.deleteVehicle);
router.get('/get-vehicle/:tokenId', ownerController.getVehicle);
router.post('/create-vehicle', ownerController.createVehicle);
router.get('/get-vehicles-data-for-view/:userId', ownerController.getVehicleDataForViewByUserId);

//for users
router.get('/get-users', ownerController.getUsers);
router.post('/fund-points/:userId', ownerController.fundPoints);

//for contract owner
router.get('/contract-owner', ownerController.getContractOwner);

module.exports = router;
