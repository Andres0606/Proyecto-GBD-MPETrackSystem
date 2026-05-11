const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

// Obtener los clientes que han sido atendidos por un asesor específico
router.get('/asesor/:cedulaAsesor', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        CEDULA as "cedula", 
        NOMBRES as "nombres", 
        APELLIDO as "apellido", 
        TELEFONO as "telefono", 
        CORREO as "correo", 
        TOTALTRAMITES as "totalTramites"
      FROM TABLE(fn_get_clientes_asesor(:1))
      ORDER BY "nombres" ASC
    `;
    const result = await connection.execute(sql, [req.params.cedulaAsesor], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', clientes: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
