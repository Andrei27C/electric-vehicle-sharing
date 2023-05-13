const express = require('express');
const { getAllVehicles } = require('../controllers/vehicles');
const { router } = require("express/lib/application");

// router.get('/get-vehicles', async (req, res) => {
//   console.log("called getAllVehicles");
//   try {
//     const vehicles = await getAllVehicles();
//     res.json({ success: true, vehicles });
//   } catch (error) {
//     console.error('Failed to fetch vehicles:', error);
//     res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
//   }
// });
