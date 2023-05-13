const express = require('express');
const { getAllVehicles } = require('../controllers/vehicles');
const { router } = require("express/lib/application");

router.get('/', async (req, res) => {
  try {
    const vehicles = await getAllVehicles();
    res.json({ success: true, vehicles });
  } catch (error) {
    console.error('Failed to fetch vehicles:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
  }
});
