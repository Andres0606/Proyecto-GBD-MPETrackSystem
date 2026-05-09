const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

// Solicitar Cita (Cliente)
router.post('/solicitar', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const data = req.body;
    
    const clientRes = await connection.execute(
      'SELECT idCliente FROM CLIENTE WHERE nDocumento = :1',
      [data.idCliente],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (clientRes.rows.length === 0) throw new Error('Cliente no encontrado');
    const realIdCliente = clientRes.rows[0].IDCLIENTE;

    const asesorRes = await connection.execute('SELECT idAsesor FROM ASESOR WHERE ROWNUM = 1');
    const idAsesor = asesorRes.rows.length > 0 ? asesorRes.rows[0][0] : 1;

    const sql = `
      INSERT INTO CITA (
        idCita, idCliente, idAsesor, placaVehiculo, tipoTramite, estadoCita, FECHAHORAPROGRAMADA
      ) VALUES (
        seq_cita.NEXTVAL, :idCliente, :idAsesor, :placaVehiculo, :tipoTramite, 'PENDIENTE', 
        CURRENT_TIMESTAMP + INTERVAL '1' DAY
      )
    `;
    
    await connection.execute(sql, {
      idCliente: realIdCliente,
      idAsesor: idAsesor,
      placaVehiculo: data.idVehiculo || null,
      tipoTramite: data.idTipoTramite
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

// Citas Pendientes (Pool global o del asesor)
router.get('/pendientes/:cedula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        c.idCita as "idCita",
        p.nombres || ' ' || p.apellidos as "cliente",
        p.telefono as "telefono",
        p.correo as "correo",
        v.Placa || ' (' || v.Marca || ')' as "vehiculo",
        tt.nombre as "tipoTramite",
        tt.valorBase as "valorBase",
        c.fechaHoraSolicitud as "fechaSolicitud",
        CASE WHEN tt.nombre = a.especialidadTramite THEN 1 ELSE 0 END as "esSuEspecialidad"
      FROM CITA c
      JOIN CLIENTE cl ON c.idCliente = cl.idCliente
      JOIN PERSONA p ON cl.nDocumento = p.nDocumento
      LEFT JOIN VEHICULO v ON c.placaVehiculo = v.Placa
      JOIN TIPOTRAMITE tt ON c.tipoTramite = tt.idTipoTramite
      CROSS JOIN ASESOR a 
      WHERE a.nDocumento = :1 AND c.estadoCita = 'PENDIENTE'
    `;
    const result = await connection.execute(sql, [req.params.cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', citas: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Citas Agendadas del Asesor
router.get('/agendadas/:cedula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        c.idCita as "idCita",
        p.nombres || ' ' || p.apellidos as "cliente",
        p.telefono as "telefono",
        v.Placa || ' (' || v.Marca || ')' as "vehiculo",
        tt.nombre as "tipoTramite",
        tt.valorBase as "valorBase",
        c.fechaHoraProgramada as "fechaProgramada"
      FROM CITA c
      JOIN ASESOR a ON c.idAsesor = a.idAsesor
      JOIN CLIENTE cl ON c.idCliente = cl.idCliente
      JOIN PERSONA p ON cl.nDocumento = p.nDocumento
      LEFT JOIN VEHICULO v ON c.placaVehiculo = v.Placa
      JOIN TIPOTRAMITE tt ON c.tipoTramite = tt.idTipoTramite
      WHERE a.nDocumento = :1 AND c.estadoCita = 'Agendada'
    `;
    const result = await connection.execute(sql, [req.params.cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', citas: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Cancelar Cita
router.post('/cancelar', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    await connection.execute(
      "UPDATE CITA SET estadoCita = 'Cancelada' WHERE idCita = :1",
      [req.body.idCita]
    );
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cita cancelada' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Atender y Agendar Cita (por parte del asesor)
router.post('/atender', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { idCita, idAsesor, fechaProgramada } = req.body;

    const asesorRes = await connection.execute(
      'SELECT idAsesor FROM ASESOR WHERE nDocumento = :1',
      [idAsesor],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (asesorRes.rows.length === 0) throw new Error('Asesor no encontrado');
    const realIdAsesor = asesorRes.rows[0].IDASESOR;

    const sql = `
      UPDATE CITA SET 
        idAsesor = :idAsesor,
        estadoCita = 'Agendada',
        fechaHoraProgramada = TO_TIMESTAMP(:fecha, 'YYYY-MM-DD"T"HH24:MI')
      WHERE idCita = :idCita
    `;

    await connection.execute(sql, {
      idAsesor: realIdAsesor,
      fecha: fechaProgramada,
      idCita: idCita
    });

    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cita agendada correctamente' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Completar Cita
router.post('/completar', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    await connection.execute(
      "UPDATE CITA SET estadoCita = 'Atendida' WHERE idCita = :1",
      [req.body.idCita]
    );
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cita marcada como atendida' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
