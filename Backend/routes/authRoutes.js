const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

router.post('/register/cliente', authController.registerCliente);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOTP);
router.get('/perfil/:cedula', authController.getPerfil);
router.put('/perfil', authController.updatePerfil);
router.post('/asesor', authController.registerAsesor);
router.get('/asesores', authController.listAsesores);
router.get('/asesores/:cedula', authController.getAsesor);
router.put('/asesores/:cedula', authController.updateAsesor);
router.delete('/asesores/:cedula', authController.deleteAsesor);

module.exports = router;
