const dashboardService = require('../service/dashboardService');

class DashboardController {
  async getStats(req, res) {
    try {
      const { cedula } = req.params;
      const stats = await dashboardService.getStatsByCedula(cedula);
      res.json(stats);
    } catch (err) {
      console.error('Dashboard Stats Error:', err);
      res.status(500).json({ error: err.message });
    }
  }

  async getAdminStats(req, res) {
    try {
      const stats = await dashboardService.getAdminStats();
      res.json(stats);
    } catch (err) {
      console.error('Admin Stats Error:', err);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new DashboardController();
