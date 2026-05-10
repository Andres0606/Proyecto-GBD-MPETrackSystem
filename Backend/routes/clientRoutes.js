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
        p.NDOCUMENTO as "cedula",
        p.NOMBRES as "nombres",
        p.APELLIDOS as "apellido",
        p.TELEFONO as "telefono",
        p.CORREO as "correo",
        COUNT(t.IDTRAMITE) as "totalTramites"
      FROM PERSONA p
      JOIN CLIENTE cl ON p.NDOCUMENTO = cl.NDOCUMENTO
      JOIN CITA c ON cl.IDCLIENTE = c.IDCLIENTE
      JOIN TRAMITE t ON c.IDCITA = t.IDCITA
      JOIN ASESOR a ON c.IDASESOR = a.IDASESOR
      WHERE a.NDOCUMENTO = :1
      GROUP BY p.NDOCUMENTO, p.NOMBRES, p.APELLIDOS, p.TELEFONO, p.CORREO
      ORDER BY p.NOMBRES ASC
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
