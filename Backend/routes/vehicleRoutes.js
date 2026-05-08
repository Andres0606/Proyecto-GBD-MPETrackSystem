const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

router.get('/cliente/:idCliente', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    
    // Consultamos los vehículos asociados al cliente
    // Nota: El frontend usa idCliente (que suele ser la cédula en este proyecto)
    const result = await connection.execute(
      `SELECT v.* FROM VEHICULO v 
       JOIN CITA c ON v.Placa = c.placaVehiculo 
       WHERE c.idCliente = :1`,
      [req.params.idCliente],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const vehiculos = result.rows.map(row => ({
      placa: row.PLACA,
      marca: row.MARCA,
      linea: row.LINEA,
      prendado: row.PRENDADO,
      estado: row.ESTADO
    }));

    res.json({ status: 'OK', vehiculos });
  } catch (err) {
    console.error('Error fetching vehicles:', err);
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
