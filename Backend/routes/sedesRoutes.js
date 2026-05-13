const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

// Obtener todas las sedes con sus municipios
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        s.idSede as "idSede",
        s.nombreSede as "nombreSede",
        m.nombreMunicipio as "nombreMunicipio"
      FROM SEDE s
      JOIN MUNICIPIO m ON s.idMunicipio = m.idMunicipio
      ORDER BY m.nombreMunicipio, s.nombreSede
    `;
    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', sedes: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
