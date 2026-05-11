const authService = require('../service/authService');

class AuthController {
  async registerCliente(req, res) {
    try {
      const result = await authService.registerCliente(req.body);
      res.status(201).json(result);
    } catch (err) {
      console.error('Register Error:', err);
      res.status(400).json({ status: 'ERROR', mensaje: err.message });
    }
  }

  async login(req, res) {
    try {
      const { correo, contrasena } = req.body;
      const result = await authService.login(correo, contrasena);
      res.json(result);
    } catch (err) {
      res.status(401).json({ status: 'ERROR', mensaje: err.message });
    }
  }

  async verifyOTP(req, res) {
    try {
      const { correo, codigo } = req.body;
      const result = await authService.verifyOTP(correo, codigo);
      res.json(result);
    } catch (err) {
      res.status(401).json({ status: 'ERROR', mensaje: err.message });
    }
  }

  async getPerfil(req, res) {
    try {
      const { cedula } = req.params;
      const result = await authService.getPerfil(cedula);
      res.json(result);
    } catch (err) {
      res.status(404).json({ status: 'ERROR', mensaje: err.message });
    }
  }

  async updatePerfil(req, res) {
    try {
      const result = await authService.updatePerfil(req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ status: 'ERROR', mensaje: err.message });
    }
  }

  async registerAsesor(req, res) {
    try {
      const result = await authService.registerAsesor(req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ status: 'ERROR', mensaje: err.message });
    }
  }

  async listAsesores(req, res) {
    try {
      const result = await authService.listAsesores();
      res.json(result);
    } catch (err) {
      res.status(500).json({ status: 'ERROR', mensaje: err.message });
    }
  }

  async deleteAsesor(req, res) {
    try {
      const { cedula } = req.params;
      const result = await authService.deleteAsesor(cedula);
      res.json(result);
    } catch (err) {
      res.status(400).json({ status: 'ERROR', mensaje: err.message });
    }
  }

  async getAsesor(req, res) {
    try {
      const { cedula } = req.params;
      const result = await authService.getAsesor(cedula);
      res.json(result);
    } catch (err) {
      res.status(404).json({ status: 'ERROR', mensaje: err.message });
    }
  }

  async updateAsesor(req, res) {
    try {
      const { cedula } = req.params;
      const result = await authService.updateAsesor(cedula, req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ status: 'ERROR', mensaje: err.message });
    }
  }
}

module.exports = new AuthController();
