const express = require('express');
const router = express.Router();
const { oracledb } = require('../config/db');

// RUTA: Listar tipos de trámite para solicitud de citas
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
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Obtener trámites del asesor
router.get('/asesor/:cedula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT * FROM vw_tramites_asesor
      WHERE "cedula_asesor" = :1
      ORDER BY "idTramite" DESC
    `;
    
    const result = await connection.execute(sql, [req.params.cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', tramites: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// NUEVA RUTA: Obtener trámites de un cliente específico (Para "Mis Trámites")
router.get('/cliente/:cedula', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const sql = `
      SELECT * FROM vw_mis_tramites 
      WHERE "cedula_cliente" = :1
      ORDER BY "idTramite" DESC
    `;
    
    const result = await connection.execute(sql, [req.params.cedula], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json({ status: 'OK', tramites: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Registrar Trámite Finalizado
router.post('/register', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { idCita, valorOtrosConceptos } = req.body;
    const sql = `
      INSERT INTO TRAMITE (IDTRAMITE, IDCITA, ESTADOTRAMITE, VALOROTROCONCEPTOS)
      VALUES (seq_tramite.NEXTVAL, :idCita, 'Activo', :otros)
      RETURNING IDTRAMITE INTO :id
    `;
    const result = await connection.execute(sql, {
      idCita: idCita,
      otros: valorOtrosConceptos || 0,
      id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    });
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Trámite registrado', idTramite: result.outBinds.id[0] });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Actualizar Estado
router.put('/estado', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const { idTramite, estado } = req.body;
    await connection.execute("UPDATE TRAMITE SET ESTADOTRAMITE = :1 WHERE IDTRAMITE = :2", [estado, idTramite]);
    await connection.commit();
    res.json({ status: 'OK', mensaje: 'Estado actualizado' });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: 'ERROR', mensaje: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
