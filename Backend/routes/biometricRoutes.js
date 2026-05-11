const express = require('express');
const router = express.Router();
const biometricController = require('../controller/biometricController');

router.post('/register', biometricController.registerFace);
router.post('/login', biometricController.loginFace);

module.exports = router;
