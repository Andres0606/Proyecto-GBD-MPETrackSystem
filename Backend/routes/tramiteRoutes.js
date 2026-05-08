const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

router.get('/list', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      'SELECT idTipoTramite as "id", nombre as "nombre", valorBase as "valorBase", requiereVehiculo as "requiereVehiculo" FROM TIPOTRAMITE',
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ status: 'OK', tiposTramite: result.rows });
  } catch (err) {
    console.error('Error fetching tramites:', err);
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
