const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');

router.get('/stats/:cedula', dashboardController.getStats);

module.exports = router;
