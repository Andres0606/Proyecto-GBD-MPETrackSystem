const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

// Obtener listas de referencia para el formulario
router.get('/colores', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      'SELECT IDCOLOR as "id", NOMBRECOLOR as "nombre" FROM COLOR ORDER BY NOMBRECOLOR',
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ status: 'OK', data: result.rows });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

router.get('/combustibles', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      'SELECT IDCOMBUSTIBLE as "id", NOMBRECOMBUSTIBLE as "nombre" FROM COMBUSTIBLE ORDER BY NOMBRECOMBUSTIBLE',
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ status: 'OK', data: result.rows });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

router.get('/tipos-servicio', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      'SELECT IDTIPOSERVICIO as "id", NOMBRESERVICIO as "nombre" FROM TIPOSERVICIO ORDER BY NOMBRESERVICIO',
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ status: 'OK', data: result.rows });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

// Registrar nuevo vehículo
router.post('/register', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const v = req.body;

    const sqlVehiculo = `
      INSERT INTO VEHICULO (
        PLACA, MARCA, LINEA, MODELO, CLASE, NUMMOTOR, NUMCHASIS, 
        COMBUSTIBLE, NUMEROVIN, TIPOSERVICIO, COLOR, ESTADO, PRENDADO
      ) VALUES (
        :placa, :marca, :linea, :modelo, :clase, :motor, :chasis,
        :comb, :vin, :serv, :color, 'ACTIVO', 'N'
      )
    `;

    await connection.execute(sqlVehiculo, {
      placa: v.placa, marca: v.marca, linea: v.linea, modelo: v.modelo,
      clase: v.clase, motor: v.numMotor, chasis: v.numChasis,
      comb: v.combustible, vin: v.numeroVin, serv: v.tipoServicio, color: v.color
    });

    await connection.execute(
      "UPDATE CITA SET PLACAVEHICULO = :1 WHERE IDCLIENTE = (SELECT IDCLIENTE FROM CLIENTE WHERE NDOCUMENTO = :2) AND PLACAVEHICULO IS NULL",
      [v.placa, v.idCliente]
    );

    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Vehículo registrado exitosamente' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
