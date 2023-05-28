const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/fund-account/:userId', userController.fundAccount);
router.get('/get-user-funds/:userId', userController.getUserFunds);
router.get('/get-user-points/:userId', userController.getUserPoints);
router.get('/user/:userId', userController.getUser);
router.get("/get-rented-vehicle/:userId", userController.getUserRentedVehicle);

module.exports = router;
