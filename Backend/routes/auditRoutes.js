const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

// Obtener todos los registros de auditoría
router.get('/logs', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        idAuditoria as "id",
        nombreTabla as "tabla",
        operacion as "operacion",
        usuarioBD as "usuario",
        TO_CHAR(fecha, 'DD/MM/YYYY HH24:MI:SS') as "fecha",
        idRegistroAfectado as "idRegistro",
        detalleCambio as "detalle"
      FROM AUDITORIA
      ORDER BY fecha DESC
    `;
    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', logs: result.rows });
  } catch (err) {
    console.error('Error obteniendo auditoría:', err);
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
