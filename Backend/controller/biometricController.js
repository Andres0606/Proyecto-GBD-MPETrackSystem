const biometricService = require('../service/biometricService');

class BiometricController {
  async registerFace(req, res) {
    try {
      const { correo, descriptor, image } = req.body;
      if (!correo || !descriptor || !image) {
        return res.status(400).json({ status: 'ERROR', mensaje: 'Faltan datos obligatorios' });
      }
      const result = await biometricService.registerFace(correo, descriptor, image);
      res.json(result);
    } catch (err) {
      console.error('Face Register Error:', err);
      res.status(500).json({ status: 'ERROR', mensaje: err.message });
    }
  }

  async loginFace(req, res) {
    try {
      const { descriptor } = req.body;
      if (!descriptor) {
        return res.status(400).json({ status: 'ERROR', mensaje: 'Descriptor facial requerido' });
      }
      const result = await biometricService.loginFace(descriptor);
      res.json(result);
    } catch (err) {
      console.error('Face Login Error:', err);
      res.status(401).json({ status: 'ERROR', mensaje: err.message });
    }
  }
}

module.exports = new BiometricController();
