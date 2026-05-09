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

// Obtener vehículos de un cliente basados en sus Citas
router.get('/cliente/:cedula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT DISTINCT
        v.PLACA as "placa",
        v.MARCA as "marca",
        v.LINEA as "linea",
        v.MODELO as "modelo",
        v.CLASE as "clase",
        ts.NOMBRESERVICIO as "tipoServicio",
        v.NUMMOTOR as "numMotor",
        v.NUMCHASIS as "numChasis",
        col.NOMBRECOLOR as "color",
        v.ESTADO as "estado",
        v.PRENDADO as "prendado",
        v.NUMEROVIN as "numeroVin",
        comb.NOMBRECOMBUSTIBLE as "combustible"
      FROM VEHICULO v
      JOIN CITA ci ON v.PLACA = ci.PLACAVEHICULO
      JOIN CLIENTE cl ON ci.IDCLIENTE = cl.IDCLIENTE
      LEFT JOIN TIPOSERVICIO ts ON v.TIPOSERVICIO = ts.IDTIPOSERVICIO
      LEFT JOIN COLOR col ON v.COLOR = col.IDCOLOR
      LEFT JOIN COMBUSTIBLE comb ON v.COMBUSTIBLE = comb.IDCOMBUSTIBLE
      WHERE cl.NDOCUMENTO = :1
    `;
    const result = await connection.execute(sql, [req.params.cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', vehiculos: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Registrar nuevo vehículo y vincularlo a la cita del trámite
router.post('/register', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const v = req.body;

    // 1. Insertar Vehículo
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

    // 2. Vincular la placa EXACTAMENTE a la cita del trámite actual
    // Buscamos la cita a través de la tabla TRAMITE
    const sqlUpdateCita = `
      UPDATE CITA SET PLACAVEHICULO = :placa 
      WHERE IDCITA = (SELECT IDCITA FROM TRAMITE WHERE IDTRAMITE = :idTramite)
    `;

    await connection.execute(sqlUpdateCita, {
      placa: v.placa,
      idTramite: v.idTramite
    });

    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Vehículo registrado y vinculado correctamente' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error in register:', err);
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
