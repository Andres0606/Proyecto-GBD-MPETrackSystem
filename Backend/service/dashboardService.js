const { oracledb } = require('../config/db');

class DashboardService {
  async getStatsByCedula(cedula) {
    let connection;
    try {
      connection = await oracledb.getConnection();
      
      // 1. Obtener ID del cliente usando la cédula (nDocumento)
      const clientRes = await connection.execute(
        'SELECT idCliente FROM CLIENTE WHERE nDocumento = :1',
        [cedula],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      if (clientRes.rows.length === 0) {
        return { citas: 0, vehiculos: 0, tramites: 0 };
      }
      
      const idCliente = clientRes.rows[0].IDCLIENTE;

      // 2. Contar citas
      const citasRes = await connection.execute(
        'SELECT COUNT(*) as TOTAL FROM CITA WHERE idCliente = :1',
        [idCliente],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      // 3. Contar vehículos únicos asociados a sus citas
      const vehiculosRes = await connection.execute(
        'SELECT COUNT(DISTINCT placaVehiculo) as TOTAL FROM CITA WHERE idCliente = :1 AND placaVehiculo IS NOT NULL',
        [idCliente],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return {
        citas: citasRes.rows[0].TOTAL || 0,
        vehiculos: vehiculosRes.rows[0].TOTAL || 0,
        tramites: 0 // Se puede expandir luego
      };
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = new DashboardService();
