const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');

router.get('/stats/:cedula', dashboardController.getStats);
router.get('/admin-stats', dashboardController.getAdminStats);

module.exports = router;
