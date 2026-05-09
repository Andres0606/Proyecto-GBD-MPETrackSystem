const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

// Listas de referencia
router.get('/colores', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      'SELECT IDCOLOR as "id", NOMBRECOLOR as "nombre" FROM COLOR ORDER BY NOMBRECOLOR',
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
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
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
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
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ status: 'OK', data: result.rows });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

// OBTENER VEHÍCULOS (Lógica de Propietario con soporte para Externos)
router.get('/cliente/:cedula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        v.PLACA as "placa", v.MARCA as "marca", v.LINEA as "linea", v.MODELO as "modelo",
        v.CLASE as "clase", ts.NOMBRESERVICIO as "tipoServicio", v.NUMMOTOR as "numMotor",
        v.NUMCHASIS as "numChasis", col.NOMBRECOLOR as "color", v.ESTADO as "estado",
        v.PRENDADO as "prendado", v.NUMEROVIN as "numeroVin", comb.NOMBRECOMBUSTIBLE as "combustible"
      FROM VEHICULO v
      LEFT JOIN TIPOSERVICIO ts ON v.TIPOSERVICIO = ts.IDTIPOSERVICIO
      LEFT JOIN COLOR col ON v.COLOR = col.IDCOLOR
      LEFT JOIN COMBUSTIBLE comb ON v.COMBUSTIBLE = comb.IDCOMBUSTIBLE
      WHERE v.PLACA IN (
          SELECT ci.PLACAVEHICULO
          FROM CITA ci
          JOIN TRAMITE tr ON ci.IDCITA = tr.IDCITA
          JOIN CLIENTE cl ON (ci.IDCLIENTE = cl.IDCLIENTE OR ci.IDCLIENTEDESTINO = cl.IDCLIENTE)
          WHERE cl.NDOCUMENTO = :1
          AND UPPER(tr.ESTADOTRAMITE) = 'FINALIZADO'
          -- CRÍTICO: La última cita finalizada es la que manda
          AND ci.IDCITA = (
              SELECT MAX(ci3.IDCITA)
              FROM CITA ci3
              JOIN TRAMITE tr3 ON ci3.IDCITA = tr3.IDCITA
              WHERE ci3.PLACAVEHICULO = v.PLACA
              AND UPPER(tr3.ESTADOTRAMITE) = 'FINALIZADO'
          )
          -- REGLAS DE PROPIEDAD ACTUALIZADAS:
          AND (
            -- 1. Soy el solicitante y soy el COMPRADOR (Caso 2)
            (ci.IDCLIENTE = cl.IDCLIENTE AND UPPER(ci.ESELDUENO) = 'N')
            OR
            -- 2. Soy el destinatario y el solicitante era el VENDEDOR (Caso 1)
            (ci.IDCLIENTEDESTINO = cl.IDCLIENTE AND UPPER(ci.ESELDUENO) = 'S')
            OR
            -- 3. Soy el solicitante, no hay destinatario NI externo (Matrícula inicial)
            (ci.IDCLIENTE = cl.IDCLIENTE AND ci.IDCLIENTEDESTINO IS NULL AND ci.IDCLIENTEEXTERNO IS NULL)
          )
      )
    `;
    const result = await connection.execute(sql, [req.params.cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', vehiculos: result.rows });
  } catch (err) {
    console.error('Error in vehicle list:', err);
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Registrar nuevo vehículo
router.post('/register', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const v = req.body;
    const sqlVehiculo = `INSERT INTO VEHICULO (PLACA, MARCA, LINEA, MODELO, CLASE, NUMMOTOR, NUMCHASIS, COMBUSTIBLE, NUMEROVIN, TIPOSERVICIO, COLOR, ESTADO, PRENDADO) VALUES (:placa, :marca, :linea, :modelo, :clase, :motor, :chasis, :comb, :vin, :serv, :color, 'ACTIVO', 'N')`;
    await connection.execute(sqlVehiculo, { placa: v.placa, marca: v.marca, linea: v.linea, modelo: v.modelo, clase: v.clase, motor: v.numMotor, chasis: v.numChasis, comb: v.combustible, vin: v.numeroVin, serv: v.tipoServicio, color: v.color });
    const sqlUpdateCita = `UPDATE CITA SET PLACAVEHICULO = :placa WHERE IDCITA = (SELECT IDCITA FROM TRAMITE WHERE IDTRAMITE = :idTramite)`;
    await connection.execute(sqlUpdateCita, { placa: v.placa, idTramite: v.idTramite });
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Vehículo registrado' });
  } catch (err) { if (connection) await connection.rollback(); res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

// Procesar Traspaso
router.post('/traspaso', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { placa, idTramite } = req.body;
    await connection.execute("UPDATE TRAMITE SET ESTADOTRAMITE = 'Finalizado' WHERE IDTRAMITE = :1", [idTramite]);
    await connection.execute("UPDATE CITA SET PLACAVEHICULO = :1 WHERE IDCITA = (SELECT IDCITA FROM TRAMITE WHERE IDTRAMITE = :2)", [placa, idTramite]);
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Traspaso completado' });
  } catch (err) { if (connection) await connection.rollback(); res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

module.exports = router;
