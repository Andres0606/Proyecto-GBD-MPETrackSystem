const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

// Configuración para que Oracle convierta los CLOBs a String automáticamente
oracledb.fetchAsString = [oracledb.CLOB];

// 1. Crear una nueva consulta (Cliente)
router.post('/solicitar', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { cedula, asunto, mensaje } = req.body;

    if (!cedula || !asunto || !mensaje) {
      return res.status(400).json({ status: 'ERROR', mensaje: 'Faltan campos obligatorios' });
    }

    const resCliente = await connection.execute(
      'SELECT IDCLIENTE FROM CLIENTE WHERE NDOCUMENTO = :1',
      [cedula],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (resCliente.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', mensaje: 'Cliente no encontrado' });
    }

    const idCliente = resCliente.rows[0].IDCLIENTE;

    const sql = `
      INSERT INTO CONSULTA (IDCONSULTA, IDCLIENTE, ASUNTO, MENSAJE, ESTADO)
      VALUES (seq_consulta.NEXTVAL, :idCliente, :asunto, :mensaje, 'PENDIENTE')
    `;

    await connection.execute(sql, { idCliente, asunto, mensaje });
    await connection.commit();

    res.json({ status: 'OK', mensaje: 'Consulta enviada correctamente' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// 2. Obtener consultas de un cliente (Cliente)
router.get('/cliente/:cedula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        c.IDCONSULTA as "idConsulta",
        c.ASUNTO as "asunto",
        c.MENSAJE as "mensaje",
        c.FECHACREACION as "fechaCreacion",
        c.RESPUESTA as "respuesta",
        c.FECHA_RESPUESTA as "fechaRespuesta",
        c.ESTADO as "estado"
      FROM CONSULTA c
      JOIN CLIENTE cl ON c.IDCLIENTE = cl.IDCLIENTE
      WHERE cl.NDOCUMENTO = :1
      ORDER BY c.FECHACREACION DESC
    `;
    const result = await connection.execute(sql, [req.params.cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', consultas: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// 3. Obtener todas las consultas para el asesor
router.get('/asesor/todas', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        c.IDCONSULTA as "idConsulta",
        p.NOMBRES || ' ' || p.APELLIDOS as "cliente",
        p.NDOCUMENTO as "cedulaCliente",
        p.TELEFONO as "telefonoCliente",
        p.CORREO as "correoCliente",
        c.ASUNTO as "asunto",
        c.MENSAJE as "mensaje",
        c.FECHACREACION as "fechaCreacion",
        c.RESPUESTA as "respuesta",
        c.FECHA_RESPUESTA as "fechaRespuesta",
        c.ESTADO as "estado"
      FROM CONSULTA c
      JOIN CLIENTE cl ON c.IDCLIENTE = cl.IDCLIENTE
      JOIN PERSONA p ON cl.NDOCUMENTO = p.NDOCUMENTO
      ORDER BY 
        CASE WHEN c.ESTADO = 'PENDIENTE' THEN 1 ELSE 2 END,
        c.FECHACREACION DESC
    `;
    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', consultas: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// 4. Responder una consulta (Asesor)
router.put('/responder', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { idConsulta, respuesta } = req.body;

    if (!idConsulta || !respuesta) {
      return res.status(400).json({ status: 'ERROR', mensaje: 'Faltan campos obligatorios' });
    }

    const sql = `
      UPDATE CONSULTA 
      SET RESPUESTA = :respuesta, 
          FECHA_RESPUESTA = CURRENT_TIMESTAMP, 
          ESTADO = 'RESPONDIDA'
      WHERE IDCONSULTA = :idConsulta
    `;

    await connection.execute(sql, { respuesta, idConsulta });
    await connection.commit();

    res.json({ status: 'OK', mensaje: 'Respuesta enviada correctamente' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
