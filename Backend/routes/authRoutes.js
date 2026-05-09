const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

router.post('/register/cliente', authController.registerCliente);
router.post('/login', authController.login);
router.get('/perfil/:cedula', authController.getPerfil);
router.put('/perfil', authController.updatePerfil);
router.post('/asesor', authController.registerAsesor);

module.exports = router;
