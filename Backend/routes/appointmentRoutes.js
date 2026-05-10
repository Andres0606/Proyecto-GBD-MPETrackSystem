const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

// Solicitar nueva cita
router.post('/solicitar', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const c = req.body;
    const sql = `
      INSERT INTO CITA (IDCITA, IDCLIENTE, PLACAVEHICULO, TIPOTRAMITE, FECHAHORASOLICITUD, ESELDUENO, IDCLIENTEDESTINO, IDCLIENTEEXTERNO)
      VALUES (seq_cita.NEXTVAL, :idCliente, :placa, :idTipo, CURRENT_TIMESTAMP, :esDueno, :idDestino, :idExterno)
    `;
    await connection.execute(sql, {
      idCliente: c.idCliente,
      placa: c.idVehiculo || null,
      idTipo: c.idTipoTramite,
      esDueno: c.esDueno || 'S',
      idDestino: c.idDestino || null,
      idExterno: c.idExterno || null
    });
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cita solicitada correctamente' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Obtener citas ACTIVAS de un cliente específico (Que aún no son trámites)
router.get('/cliente/:cedula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT * FROM vw_mis_citas 
      WHERE "cedula_cliente" = :1
      ORDER BY 
        CASE WHEN "fechaCita" IS NULL THEN 2 ELSE 1 END,
        "fechaCita" ASC,
        "fechaSolicitud" DESC
    `;
    const result = await connection.execute(sql, [req.params.cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', citas: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Obtener citas pendientes para el asesor (Sin agendar)
router.get('/pendientes/:cedulaAsesor', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        c.IDCITA as "idCita",
        p.NOMBRES || ' ' || p.APELLIDOS as "cliente",
        p.NDOCUMENTO as "cedulaCliente",
        p.TELEFONO as "telefono",
        p.CORREO as "correo",
        tt.NOMBRE as "tipoTramite",
        tt.VALORBASE as "valorBase",
        c.PLACAVEHICULO as "vehiculo",
        c.FECHAHORASOLICITUD as "fechaSolicitud",
        1 as "esSuEspecialidad"
      FROM CITA c
      JOIN CLIENTE cl ON c.IDCLIENTE = cl.IDCLIENTE
      JOIN PERSONA p ON cl.NDOCUMENTO = p.NDOCUMENTO
      JOIN TIPOTRAMITE tt ON c.TIPOTRAMITE = tt.IDTIPOTRAMITE
      WHERE c.FECHAHORAPROGRAMADA IS NULL
      AND c.IDCITA NOT IN (SELECT IDCITA FROM TRAMITE)
      ORDER BY c.FECHAHORASOLICITUD ASC
    `;
    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', citas: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Obtener citas AGENDADAS por un asesor
router.get('/agendadas/:cedulaAsesor', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        c.IDCITA as "idCita",
        p.NOMBRES || ' ' || p.APELLIDOS as "cliente",
        p.TELEFONO as "telefono",
        c.PLACAVEHICULO as "vehiculo",
        tt.NOMBRE as "tipoTramite",
        c.FECHAHORAPROGRAMADA as "fechaProgramada"
      FROM CITA c
      JOIN CLIENTE cl ON c.IDCLIENTE = cl.IDCLIENTE
      JOIN PERSONA p ON cl.NDOCUMENTO = p.NDOCUMENTO
      JOIN TIPOTRAMITE tt ON c.TIPOTRAMITE = tt.IDTIPOTRAMITE
      JOIN ASESOR a ON c.IDASESOR = a.IDASESOR
      WHERE a.NDOCUMENTO = :1
      AND c.FECHAHORAPROGRAMADA IS NOT NULL
      AND c.IDCITA NOT IN (SELECT IDCITA FROM TRAMITE)
      ORDER BY c.FECHAHORAPROGRAMADA ASC
    `;
    const result = await connection.execute(sql, [req.params.cedulaAsesor], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', citas: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Cancelar cita (Limpiar fecha programada)
router.post('/cancelar', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { idCita } = req.body;
    await connection.execute(
      "UPDATE CITA SET FECHAHORAPROGRAMADA = NULL, IDASESOR = NULL WHERE IDCITA = :1",
      [idCita]
    );
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cita cancelada y devuelta a pendientes' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Asignar fecha y hora a una cita (Agendar)
router.put('/agendar', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { idCita, fechaHora, idAsesor } = req.body;

    let idAsesorReal = idAsesor;
    if (idAsesor && idAsesor.toString().length > 5) {
       const resAsesor = await connection.execute(
         'SELECT IDASESOR FROM ASESOR WHERE NDOCUMENTO = :1',
         [idAsesor],
         { outFormat: oracledb.OUT_FORMAT_OBJECT }
       );
       if (resAsesor.rows.length > 0) idAsesorReal = resAsesor.rows[0].IDASESOR;
    }

    await connection.execute(
      "UPDATE CITA SET FECHAHORAPROGRAMADA = TO_TIMESTAMP(:1, 'YYYY-MM-DD\"T\"HH24:MI'), IDASESOR = :2 WHERE IDCITA = :3",
      [fechaHora, idAsesorReal, idCita]
    );
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cita agendada correctamente' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
