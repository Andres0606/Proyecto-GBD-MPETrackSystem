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
        CEDULA as "cedula", 
        NOMBRES as "nombres", 
        APELLIDO as "apellido", 
        TELEFONO as "telefono", 
        CORREO as "correo", 
        TOTALTRAMITES as "totalTramites"
      FROM TABLE(fn_get_clientes_asesor(:1))
      ORDER BY "nombres" ASC
    `;
    const result = await connection.execute(sql, [req.params.cedulaAsesor], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', clientes: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// NUEVA RUTA: Obtener TODOS los clientes (Para el Administrador)
router.get('/all', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        cedula as "cedula", 
        nombres as "nombres", 
        apellido as "apellido", 
        telefono as "telefono", 
        correo as "correo", 
        totalCitas as "totalCitas",
        licencia as "licencia"
      FROM TABLE(fn_get_todos_los_clientes())
      ORDER BY "nombres" ASC
    `;
    const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', clientes: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// OBTENER UN SOLO CLIENTE (Para edición)
router.get('/:cedula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        p.nDocumento as "cedula",
        p.nombres as "nombres",
        p.apellidos as "apellido",
        p.telefono as "telefono",
        p.correo as "correo",
        cl.licenciaConduccion as "licencia"
      FROM CLIENTE cl
      JOIN PERSONA p ON cl.nDocumento = p.nDocumento
      WHERE p.nDocumento = :1
    `;
    const result = await connection.execute(sql, [req.params.cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (result.rows.length === 0) return res.status(404).json({ status: 'ERROR', mensaje: 'Cliente no encontrado' });
    res.json({ status: 'OK', cliente: result.rows[0] });
  } catch (err) { res.status(500).json({ status: 'ERROR', mensaje: err.message }); }
  finally { if (connection) await connection.close(); }
});

// ACTUALIZAR CLIENTE
router.put('/:cedula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { nombres, apellido, telefono, licencia } = req.body;
    const { cedula } = req.params;

    // 1. Actualizar en PERSONA
    await connection.execute(
      "UPDATE PERSONA SET nombres = :1, apellidos = :2, telefono = :3 WHERE nDocumento = :4",
      [nombres, apellido, telefono, cedula]
    );

    // 2. Actualizar en CLIENTE
    await connection.execute(
      "UPDATE CLIENTE SET licenciaConduccion = :1 WHERE nDocumento = :2",
      [licencia, cedula]
    );

    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cliente actualizado correctamente' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ELIMINAR CLIENTE
router.delete('/:cedula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { cedula } = req.params;

    // 1. Eliminar de CLIENTE (Primero el rol)
    await connection.execute("DELETE FROM CLIENTE WHERE nDocumento = :1", [cedula]);

    // 2. Eliminar de PERSONA (Luego la entidad base)
    await connection.execute("DELETE FROM PERSONA WHERE nDocumento = :1", [cedula]);

    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Cliente eliminado correctamente' });
  } catch (err) {
    if (connection) await connection.rollback();
    // Capturamos el error del disparador ORA-20003
    const msg = err.message.includes('ORA-20003') 
      ? 'No se puede eliminar: El cliente tiene citas registradas en el sistema.' 
      : err.message;
    res.status(500).json({ status: 'ERROR', mensaje: msg });
  }
});

// OBTENER HISTORIAL DE TRÁMITES DE UN CLIENTE (Usando Colección de Oracle)
router.get('/:cedula/historial', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT 
        idTramite as "id",
        tipoTramite as "tipo",
        fecha as "fecha",
        estado as "estado",
        vehiculo as "vehiculo",
        valorTotal as "total"
      FROM TABLE(fn_get_historial_cliente(:1))
    `;
    const result = await connection.execute(sql, [req.params.cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', historial: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
